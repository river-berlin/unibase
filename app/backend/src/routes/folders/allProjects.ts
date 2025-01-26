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
  folder_id: string | null;
  created_at: string;
  updated_at: string;
  folder_name: string | null;
  folder_path: string | null;
}

interface AuthenticatedRequest extends Request {
  user?: User;
  params: {
    organizationId: string;
  };
}

const router = Router();

/**
 * Get all projects owned by the user in an organization
 * 
 * @route GET /folders/projects/org/:organizationId
 */
router.get(
  '/projects/org/:organizationId',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const projects = await db
        .selectFrom('projects')
        .leftJoin('folders', 'folders.id', 'projects.folder_id')
        .selectAll('projects')
        .select(['folders.name as folder_name', 'folders.path as folder_path'])
        .where('projects.created_by', '=', req.user.id)
        .where('projects.organization_id', '=', req.params.organizationId)
        .orderBy(['folders.path', 'projects.name'])
        .execute();

      res.json(projects);
    } catch (error) {
      console.error('Error fetching user projects:', error);
      res.status(500).json({ error: 'Error fetching user projects' });
    }
  }
);

export default router; 