import { Router, Response, Request } from 'express';
import { db } from '../../../database/db';
import { authenticateToken, isAdmin } from '../../../middleware/auth';
import { sql } from 'kysely';

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

    if (!user || userId === user.userId) {
      res.status(400).json({
        error: 'Cannot delete your own account'
      });
      return;
    }

    try {
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

      await db.transaction().execute(async (trx) => {
        // Update projects where user is creator/modifier
        await trx
          .updateTable('projects')
          .set({
            created_by: '',
            last_modified_by: '',
            updated_at: new Date().toISOString()
          })
          .where((eb) => 
            eb.or([
              eb('created_by', '=', userId),
              eb('last_modified_by', '=', userId)
            ])
          );

        // Delete user's organization memberships
        await trx.deleteFrom('organization_members').where('user_id', '=', userId);

        // Delete the user
        await trx.deleteFrom('users').where('id', '=', userId);
      });

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
);

export default router; 