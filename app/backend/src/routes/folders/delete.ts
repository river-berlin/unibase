import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';

interface DeleteFolderRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
  params: {
    folderId: string;
  };
}

const router = Router();

/**
 * Delete a folder
 * 
 * @route DELETE /folders/:folderId
 */
router.delete(
  '/:folderId',
  authenticateToken,
  async (req: DeleteFolderRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const db = req.app.locals.db;

      // First get the folder to check permissions
      const folder = await db
        .selectFrom('folders')
        .select(['organization_id'])
        .where('id', '=', req.params.folderId)
        .executeTakeFirst();

      if (!folder) {
        res.status(404).json({ error: 'Folder not found' });
        return;
      }

      // Verify user has access and role in this organization
      const hasAccess = await db
        .selectFrom('organization_members')
        .select(['user_id', 'role'])
        .where('organization_id', '=', folder.organization_id)
        .where('user_id', '=', req.user.userId)
        .executeTakeFirst();

      if (!hasAccess) {
        res.status(403).json({ error: 'No access to this folder' });
        return;
      }

      // Only allow deletion if user is owner/admin
      if (hasAccess.role !== 'owner' && hasAccess.role !== 'admin') {
        res.status(403).json({ error: 'No permission to delete this folder' });
        return;
      }

      await db
        .deleteFrom('folders')
        .where('id', '=', req.params.folderId)
        .execute();

      res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
      console.error('Error deleting folder:', error);
      res.status(500).json({ error: 'Error deleting folder' });
    }
  }
);

export default router; 