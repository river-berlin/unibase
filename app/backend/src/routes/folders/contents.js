import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { db } from '../../database/db.js';

const router = Router();

/**
 * Get contents of a specific folder
 * 
 * @route GET /folders/:folderId/contents
 */
router.get(
  '/:folderId/contents',
  authenticateToken,
  async (req, res) => {
    try {
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
        .select([
          'projects.id',
          'projects.name',
          'projects.description',
          'projects.icon',
          'projects.created_at',
          'projects.updated_at',
          'users.name as created_by_name'
        ])
        .innerJoin('users', 'users.id', 'projects.created_by')
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
      if (error.message === 'User does not have access to this organization') {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error fetching folder contents' });
    }
  }
);

export default router; 