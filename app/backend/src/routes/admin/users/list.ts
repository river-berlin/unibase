import { Router, Response } from 'express';
import { authenticateToken, isAdmin } from '../../../middleware/auth';
import { query, validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../../../types';
import { ExpressionBuilder } from 'kysely';
import { Database } from '../../../database/types';

interface ListUsersRequest extends AuthenticatedRequest {
  query: {
    page?: string;
    limit?: string;
    search?: string;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  last_login_at: string | null;
  is_admin: number;
}

const router = Router();

/**
 * Get all users with pagination and search (admin only)
 * 
 * @route GET /admin/users
 * @query {number} page - Page number (1-based)
 * @query {number} limit - Items per page
 * @query {string} search - Search term for email or name
 * @returns {Object} { users: User[], total: number, page: number, totalPages: number }
 */
router.get(
  '/',
  [
    authenticateToken,
    isAdmin,
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().isString().trim()
  ],
  async (req: ListUsersRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const db = req.app.locals.db;
      const page = parseInt(req.query.page || '1');
      const limit = parseInt(req.query.limit || '20');
      const offset = (page - 1) * limit;
      const search = req.query.search;

      // Build base query
      let baseQuery = db
        .selectFrom('users')
        .select([
          'id',
          'email',
          'name',
          'created_at',
          'last_login_at',
          'is_admin'
        ]);

      // Add search condition if search term provided
      if (search) {
        baseQuery = baseQuery.where((eb: ExpressionBuilder<Database, 'users'>) => eb.or([
          eb('email', 'like', `%${search}%`),
          eb('name', 'like', `%${search}%`)
        ]));
      }

      // Get total count
      const countResult = await baseQuery
        .select((eb: ExpressionBuilder<Database, 'users'>) => eb.fn.countAll().as('count'))
        .executeTakeFirst();

      const total = Number(countResult?.count || 0);
      const totalPages = Math.ceil(total / limit);

      // Get paginated results
      const users = await baseQuery
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset)
        .execute();

      // Add organization info for each user
      const usersWithOrgs = await Promise.all(users.map(async (user: User) => {
        const orgs = await db
          .selectFrom('organization_members')
          .innerJoin('organizations', 'organizations.id', 'organization_members.organization_id')
          .select([
            'organizations.id',
            'organizations.name',
            'organization_members.role'
          ])
          .where('organization_members.user_id', '=', user.id)
          .execute();

        return {
          ...user,
          organizations: orgs
        };
      }));

      res.json({
        users: usersWithOrgs,
        total,
        page,
        totalPages
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error fetching users' });
    }
  }
);

export default router; 