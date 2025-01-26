import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { Database } from '../../database/types';

interface DeleteProjectRequest extends Request {
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
 * Delete a project
 * 
 * @route DELETE /projects/:projectId
 */
router.delete('/:projectId', authenticateToken, async (req: DeleteProjectRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const db = req.app.locals.db;

    // Get project and verify it exists
    const project = await db
      .selectFrom('projects')
      .select(['organization_id'])
      .where('id', '=', req.params.projectId)
      .executeTakeFirst();

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Verify user has access to this organization
    const hasAccess = await db
      .selectFrom('organization_members')
      .select('user_id')
      .where('organization_id', '=', project.organization_id)
      .where('user_id', '=', req.user.userId)
      .executeTakeFirst();

    if (!hasAccess) {
      res.status(403).json({ error: 'No access to this organization' });
      return;
    }

    // Delete the project
    await db
      .deleteFrom('projects')
      .where('id', '=', req.params.projectId)
      .execute();

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Error deleting project' });
  }
});

export default router; 