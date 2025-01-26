import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { db } from '../../database/db';
import { Database } from '../../database/types';

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
  organization_id: string;
  folder_id: string | null;
  icon: string;
  created_at: string;
  updated_at: string;
  folder_name: string | null;
  folder_path: string | null;
  created_by_name: string;
}

interface AuthenticatedRequest extends Request {
  user?: User;
  params: {
    projectId: string;
  };
}

const router = Router();

/**
 * Get single project
 * 
 * @route GET /projects/:projectId
 */
router.get('/:projectId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const project = await db
      .selectFrom('projects')
      .leftJoin('folders', 'folders.id', 'projects.folder_id')
      .innerJoin('users', 'users.id', 'projects.created_by')
      .selectAll('projects')
      .select(['folders.name as folder_name', 'folders.path as folder_path', 'users.name as created_by_name'])
      .where('projects.id', '=', req.params.projectId)
      .executeTakeFirst();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify user has access to this project's organization
    const hasAccess = await db
      .selectFrom('organization_members')
      .select('user_id')
      .where('organization_id', '=', project.organization_id)
      .where('user_id', '=', req.user.id)
      .executeTakeFirst();

    if (!hasAccess) {
      return res.status(403).json({ error: 'No access to this project' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Error fetching project' });
  }
});

export default router; 