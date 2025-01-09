import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { db } from '../../database/db.js';

const router = Router();

/**
 * Get all projects owned by the user in an organization
 * 
 * @route GET /folders/projects/org/:organizationId
 */
router.get(
  '/projects/org/:organizationId',
  authenticateToken,
  async (req, res) => {
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