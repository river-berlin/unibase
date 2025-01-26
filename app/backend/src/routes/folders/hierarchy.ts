import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { db } from '../../database/db';

interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
}

interface FolderHierarchy {
  id: string;
  name: string;
  parent_folder_id: string | null;
}

interface AuthenticatedRequest extends Request {
  user?: User;
  params: {
    folderId: string;
  };
  query: {
    organizationId: string;
  };
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
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
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