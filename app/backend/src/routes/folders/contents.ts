import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { db } from '../../database/db';

interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
  created_by_name: string;
}

interface Folder {
  id: string;
  name: string;
  path: string;
  created_at: string;
  updated_at: string;
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
 * Get contents of a specific folder
 * 
 * @route GET /folders/:folderId/contents
 */
router.get(
  '/:folderId/contents',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // First verify user has access to this organization
      const hasAccess = await db
        .selectFrom('organization_members')
        .select('user_id')
        .where('organization_id', '=', req.query.organizationId)
        .where('user_id', '=', req.user.id)
        .executeTakeFirst();

      if (!hasAccess) {
        throw new Error('User does not have access to this organization');
      }

      // Get all projects in the folder
      const projects = await db
        .selectFrom('projects')
        .innerJoin('users', 'users.id', 'projects.created_by')
        .select([
          'projects.id',
          'projects.name',
          'projects.description',
          'projects.icon',
          'projects.created_at',
          'projects.updated_at',
          'users.name as created_by_name'
        ])
        .where('projects.folder_id', '=', req.params.folderId)
        .where('projects.organization_id', '=', req.query.organizationId)
        .orderBy('projects.name')
        .execute();

      // Get all subfolders
      const subfolders = await db
        .selectFrom('folders')
        .select([
          'id',
          'name',
          'path',
          'created_at',
          'updated_at'
        ])
        .where('parent_folder_id', '=', req.params.folderId)
        .where('organization_id', '=', req.query.organizationId)
        .orderBy('name')
        .execute();

      res.json({
        projects,
        subfolders
      });
    } catch (error) {
      console.error('Error fetching folder contents:', error);
      if (error instanceof Error && error.message === 'User does not have access to this organization') {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error fetching folder contents' });
    }
  }
);

export default router; 