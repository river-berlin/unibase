import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';

interface GetFolderHierarchyRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
  params: {
    folderId: string;
  };
  query: {
    organizationId: string;
  };
}

interface FolderHierarchy {
  id: string;
  name: string;
  parent_folder_id: string | null;
}

const router = Router();

/**
 * Get folder hierarchy (path from root)
 * 
 * @route GET /folders/:folderId/hierarchy
 */
router.get(
  '/:folderId/hierarchy',
  authenticateToken,
  async (req: GetFolderHierarchyRequest, res: Response): Promise<void> => {
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
        .where('organization_id', '=', req.query.organizationId)
        .where('user_id', '=', req.user.userId)
        .executeTakeFirst();

      if (!hasAccess) {
        res.status(403).json({ error: 'No access to this organization' });
        return;
      }

      const hierarchy: FolderHierarchy[] = [];
      let currentFolder = await db
        .selectFrom('folders')
        .select(['id', 'name', 'parent_folder_id'])
        .where('id', '=', req.params.folderId)
        .where('organization_id', '=', req.query.organizationId)
        .executeTakeFirst();

      while (currentFolder) {
        hierarchy.unshift(currentFolder);
        if (!currentFolder.parent_folder_id) break;

        currentFolder = await db
          .selectFrom('folders')
          .select(['id', 'name', 'parent_folder_id'])
          .where('id', '=', currentFolder.parent_folder_id)
          .where('organization_id', '=', req.query.organizationId)
          .executeTakeFirst();
      }

      res.json(hierarchy);
    } catch (error) {
      console.error('Error fetching folder hierarchy:', error);
      res.status(500).json({ error: 'Error fetching folder hierarchy' });
    }
  }
);

export default router; 