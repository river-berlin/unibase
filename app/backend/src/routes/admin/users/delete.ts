import { Router, Response, Request } from 'express';
import { authenticateToken, isAdmin } from '../../../middleware/auth';
import { sql, Transaction, ExpressionBuilder } from 'kysely';
import { Database } from '../../../database/types';

interface DeleteUserRequest extends Request {
  params: {
    userId: string;
  };
  user?: {
    userId: string;
    email: string;
    name: string;
  };
}

const router = Router();

/**
 * Delete user (admin only)
 * 
 * @route DELETE /admin/users/:userId
 * @param {string} userId - User ID to delete
 */
router.delete(
  '/:userId',
  authenticateToken,
  isAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    const user = (req as DeleteUserRequest).user;
    const db = req.app.locals.db;

    if (!user || userId === user.userId) {
      res.status(400).json({
        error: 'Cannot delete your own account'
      });
      return;
    }

    try {
      // Log available tables
      const tables = await db.introspection.getTables();
      console.log('Available tables before operations:', tables.map((t: { name: string }) => t.name));

      // Check if user exists
      const existingUser = await db
        .selectFrom('users')
        .select(['id'])
        .where('id', '=', userId)
        .executeTakeFirst();

      if (!existingUser) {
        res.status(404).json({
          error: 'User not found'
        });
        return;
      }

      await db.transaction().execute(async (trx: Transaction<Database>) => {
        // Delete projects where user is creator/modifier
        await trx
          .deleteFrom('projects')
          .where((eb: ExpressionBuilder<Database, 'projects'>) => 
            eb.or([
              eb('created_by', '=', userId),
              eb('last_modified_by', '=', userId)
            ])
          )
          .execute();

        // Delete user's organization memberships
        await trx
          .deleteFrom('organization_members')
          .where('user_id', '=', userId)
          .execute();

        // Delete the user
        await trx
          .deleteFrom('users')
          .where('id', '=', userId)
          .execute();
      });

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
);

export default router; 