import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { db } from '../../database/db.js';

const router = Router();

/**
 * Get user's projects in an organization
 * 
 * @route GET /projects/org/:organizationId
 */
router.get('/org/:organizationId', authenticateToken, async (req, res) => {
  try {
    const projects = await db
      .selectFrom('projects')
      .select([
        'projects.id',
        'projects.name',
        'projects.description',
        'projects.icon',
        'projects.folder_id',
        'projects.created_at',
        'projects.updated_at',
        'folders.name as folder_name',
        'folders.path as folder_path'
      ])
      .leftJoin('folders', 'folders.id', 'projects.folder_id')
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