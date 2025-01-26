import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { db } from '../../database/db.js';

interface User {
  id: string;
  email: string;
}

interface ProjectWithFolder {
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
  user: User;
  params: {
    organizationId: string;
  };
}

const router = Router();

/**
 * Get user's projects in an organization
 * 
 * @route GET /projects/org/:organizationId
 */
router.get('/org/:organizationId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projects = await db
      .selectFrom('projects')
      .leftJoin('folders', 'folders.id', 'projects.folder_id')
      .selectAll('projects')
      .select(['folders.name as folder_name', 'folders.path as folder_path'])
      .where('projects.organization_id', '=', req.params.organizationId)
      .orderBy(['folders.path', 'projects.name'])
      .execute();

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Error fetching projects' });
  }
});

export default router; 