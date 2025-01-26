import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';

interface GetFoldersRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
  params: {
    organizationId: string;
  };
}

const router = Router();

/**
 * Get all folders accessible to the user in an organization
 * 
 * @route GET /folders/org/:organizationId
 */
router.get(
  '/org/:organizationId',
  authenticateToken,
  async (req: GetFoldersRequest, res: Response): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const db = req.app.locals.db;

      // First verify user has access to this organization
      const hasAccess = await db
        .selectFrom('organization_members')
        .select('user_id')
        .where('organization_id', '=', req.params.organizationId)
        .where('user_id', '=', req.user.userId)
        .executeTakeFirst();

      if (!hasAccess) {
        res.status(403).json({ error: 'No access to this organization' });
        return;
      }

      const folders = await db
        .selectFrom('folders')
        .select([
          'folders.id',
          'folders.name',
          'folders.path',
          'folders.parent_folder_id',
          'folders.created_at',
          'folders.updated_at'
        ])
        .where('folders.organization_id', '=', req.params.organizationId)
        .orderBy('folders.path')
        .execute();

      res.json(folders);
    } catch (error) {
      console.error('Error fetching folders:', error);
      res.status(500).json({ error: 'Error fetching folders' });
    }
  }
);

export default router; 