import { Router, Response, Request } from 'express';
import { authenticateToken, isAdmin } from '../../../middleware/auth';
import { body, validationResult } from 'express-validator';

interface UpdateUserRoleRequest extends Request {
  params: {
    userId: string;
  };
  body: {
    isAdmin: boolean;
  };
  user?: {
    userId: string;
    email: string;
    name: string;
  };
}

const router = Router();

/**
 * Update user role (admin only)
 * 
 * @route PUT /admin/users/:userId/role
 * @param {string} userId - User ID to update
 * @param {boolean} isAdmin - New admin status
 */
router.put(
  '/:userId/role',
  authenticateToken,
  isAdmin,
  body('isAdmin').isBoolean(),
  async (req: UpdateUserRoleRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.params.userId;
    const user = req.user;
    const { isAdmin: newIsAdmin } = req.body;
    const db = req.app.locals.db;

    if (!user || userId === user.userId) {
      res.status(400).json({
        error: 'Cannot modify your own admin status'
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

      await db
        .updateTable('users')
        .set({
          is_admin: newIsAdmin ? 1 : 0,
          updated_at: new Date().toISOString()
        })
        .where('id', '=', userId)
        .execute();

      res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }
);

export default router; 