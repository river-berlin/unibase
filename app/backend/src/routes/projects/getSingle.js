import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { db } from '../../database/db.js';

const router = Router();

/**
 * Get single project
 * 
 * @route GET /projects/:projectId
 */
router.get('/:projectId', authenticateToken, async (req, res) => {
  try {
    const project = await db
      .selectFrom('projects')
      .select([
        'projects.id',
        'projects.name',
        'projects.description',
        'projects.organization_id',
        'projects.folder_id',
        'projects.icon',
        'projects.created_at',
        'projects.updated_at',
        'folders.name as folder_name',
        'folders.path as folder_path',
        'users.name as created_by_name'
      ])
      .leftJoin('folders', 'folders.id', 'projects.folder_id')
      .innerJoin('users', 'users.id', 'projects.created_by')
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