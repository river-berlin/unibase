import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';

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

interface GetProjectRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
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
router.get('/:projectId', authenticateToken, async (req: GetProjectRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const db = req.app.locals.db;
    const project = await db
      .selectFrom('projects')
      .leftJoin('folders', 'folders.id', 'projects.folder_id')
      .innerJoin('users', 'users.id', 'projects.created_by')
      .selectAll('projects')
      .select(['folders.name as folder_name', 'folders.path as folder_path', 'users.name as created_by_name'])
      .where('projects.id', '=', req.params.projectId)
      .executeTakeFirst();

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Verify user has access to this project's organization
    const hasAccess = await db
      .selectFrom('organization_members')
      .select('user_id')
      .where('organization_id', '=', project.organization_id)
      .where('user_id', '=', req.user.userId)
      .executeTakeFirst();

    if (!hasAccess) {
      res.status(403).json({ error: 'No access to this project' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Error fetching project' });
  }
});

export default router; 