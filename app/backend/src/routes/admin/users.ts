import { Router, Request, Response } from 'express';
import { db } from '../../database/db';
import { authenticateToken, isAdmin } from '../../middleware/auth';

interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
}

interface AuthenticatedRequest extends Request {
  user?: User;
  params: {
    userId: string;
  };
  body: {
    isAdmin?: boolean;
  };
}

const router = Router();

/**
 * Get all users (admin only)
 * 
 * @route GET /admin/users
 * @returns {Array} List of users
 */
router.get(
  '/users',
  [authenticateToken, isAdmin],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const users = await db
        .selectFrom('users')
        .select([
          'id',
          'email',
          'name',
          'created_at',
          'last_login_at',
          'is_admin'
        ])
        .orderBy('created_at', 'desc')
        .execute();

      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error fetching users' });
    }
  }
);

/**
 * Update user role (admin only)
 * 
 * @route PATCH /admin/users/:userId/role
 * @param {string} userId - User ID to update
 * @param {boolean} isAdmin - New admin status
 */
router.patch(
  '/users/:userId/role',
  [authenticateToken, isAdmin],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const { isAdmin: newIsAdmin } = req.body;

      if (userId === req.user?.id) {
        return res.status(400).json({
          error: 'Cannot modify your own admin status'
        });
      }

      await db
        .updateTable('users')
        .set({
          is_admin: newIsAdmin,
          updated_at: new Date().toISOString()
        })
        .where('id', '=', userId)
        .execute();

      res.json({ message: 'User role updated successfully' });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'Error updating user role' });
    }
  }
);

/**
 * Delete user (admin only)
 * 
 * @route DELETE /admin/users/:userId
 * @param {string} userId - User ID to delete
 */
router.delete(
  '/users/:userId',
  [authenticateToken, isAdmin],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;

      if (userId === req.user?.id) {
        return res.status(400).json({
          error: 'Cannot delete your own account'
        });
      }

      await db.transaction().execute(async (trx) => {
        // Delete user's organization memberships
        await trx
          .deleteFrom('organization_members')
          .where('user_id', '=', userId)
          .execute();

        // Delete user
        await trx
          .deleteFrom('users')
          .where('id', '=', userId)
          .execute();
      });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Error deleting user' });
    }
  }
);

export default router; 