import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { db } from '../../database/db.js';

const router = Router();

/**
 * Get all folders accessible to the user in an organization
 * 
 * @route GET /folders/org/:organizationId
 */
router.get(
  '/org/:organizationId',
  authenticateToken,
  async (req, res) => {
    try {
      const folders = await db
        .selectFrom('folders')
        .select([
          'folders.id',
          'folders.name',
          'folders.path',
          'folders.parent_folder_id',
          'folders.created_at',
          'folders.updated_at'
        ])
        .innerJoin(
          'organization_members',
          'organization_members.organization_id',
          'folders.organization_id'
        )
        .where('organization_members.user_id', '=', req.user.id)
        .where('folders.organization_id', '=', req.params.organizationId)
        .orderBy('folders.path')
        .execute();

      res.json(folders);
    } catch (error) {
      console.error('Error fetching folders:', error);
      res.status(500).json({ error: 'Error fetching folders' });
    }
  }
);

export default router; 