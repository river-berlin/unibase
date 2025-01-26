import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { db } from '../../database/db';

interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
}

interface Folder {
  organization_id: string;
}

interface OrganizationMember {
  user_id: string;
  role: 'owner' | 'admin' | 'member';
}

interface AuthenticatedRequest extends Request {
  user?: User;
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
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // First get the folder to check permissions
      const folder = await db
        .selectFrom('folders')
        .select(['organization_id'])
        .where('id', '=', req.params.folderId)
        .executeTakeFirst();

      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' });
      }

      // Verify user has access and role in this organization
      const hasAccess = await db
        .selectFrom('organization_members')
        .select(['user_id', 'role'])
        .where('organization_id', '=', folder.organization_id)
        .where('user_id', '=', req.user.id)
        .executeTakeFirst();

      if (!hasAccess) {
        return res.status(403).json({ error: 'No access to this folder' });
      }

      // Only allow deletion if user is owner/admin
      if (hasAccess.role !== 'owner' && hasAccess.role !== 'admin') {
        return res.status(403).json({ error: 'No permission to delete this folder' });
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