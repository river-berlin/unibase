import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { db } from '../../database/db.js';

const router = Router();

/**
 * Get folder hierarchy (path from root)
 * 
 * @route GET /folders/:folderId/hierarchy
 */
router.get(
  '/:folderId/hierarchy',
  authenticateToken,
  async (req, res) => {
    try {
      const hierarchy = [];
      let currentFolder = await db
        .selectFrom('folders')
        .select(['id', 'name', 'parent_folder_id'])
        .where('id', '=', req.params.folderId)
        .where('organization_id', '=', req.query.organizationId)
        .executeTakeFirst();

      while (currentFolder) {
        hierarchy.unshift(currentFolder);
        if (!currentFolder.parent_folder_id) break;

        currentFolder = await db
          .selectFrom('folders')
          .select(['id', 'name', 'parent_folder_id'])
          .where('id', '=', currentFolder.parent_folder_id)
          .where('organization_id', '=', req.query.organizationId)
          .executeTakeFirst();
      }

      res.json(hierarchy);
    } catch (error) {
      console.error('Error fetching folder hierarchy:', error);
      res.status(500).json({ error: 'Error fetching folder hierarchy' });
    }
  }
);

export default router; 