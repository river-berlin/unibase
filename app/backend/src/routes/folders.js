import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import {
  getUserFolders,
  getFolderContents,
  getUserProjects,
  getFolderHierarchy
} from '../services/folder.service.js';
import { db } from '../database/db.js';

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
      const folders = await getUserFolders(
        req.user.id,
        req.params.organizationId
      );
      res.json(folders);
    } catch (error) {
      console.error('Error fetching folders:', error);
      res.status(500).json({ error: 'Error fetching folders' });
    }
  }
);

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
      const contents = await getFolderContents(
        req.params.folderId,
        req.query.organizationId,
        req.user.id
      );
      res.json(contents);
    } catch (error) {
      console.error('Error fetching folder contents:', error);
      if (error.message === 'User does not have access to this organization') {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error fetching folder contents' });
    }
  }
);

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
      const projects = await getUserProjects(
        req.user.id,
        req.params.organizationId
      );
      res.json(projects);
    } catch (error) {
      console.error('Error fetching user projects:', error);
      res.status(500).json({ error: 'Error fetching user projects' });
    }
  }
);

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
      const hierarchy = await getFolderHierarchy(
        req.params.folderId,
        req.query.organizationId
      );
      res.json(hierarchy);
    } catch (error) {
      console.error('Error fetching folder hierarchy:', error);
      res.status(500).json({ error: 'Error fetching folder hierarchy' });
    }
  }
);

/**
 * Create a new folder
 * 
 * @route POST /folders
 */
router.post(
  '/',
  [
    authenticateToken,
    body('name').trim().notEmpty(),
    body('organizationId').notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, organizationId, parentFolderId } = req.body;

      // Verify user has access to this organization
      const hasAccess = await db
        .selectFrom('organization_members')
        .select('user_id')
        .where('organization_id', '=', organizationId)
        .where('user_id', '=', req.user.id)
        .executeTakeFirst();

      if (!hasAccess) {
        return res.status(403).json({ error: 'No access to this organization' });
      }

      // If parent folder specified, verify it exists and is in the same organization
      if (parentFolderId) {
        const parentFolder = await db
          .selectFrom('folders')
          .select(['id', 'path'])
          .where('id', '=', parentFolderId)
          .where('organization_id', '=', organizationId)
          .executeTakeFirst();

        if (!parentFolder) {
          return res.status(404).json({ error: 'Parent folder not found' });
        }
      }

      const now = new Date().toISOString();
      const folderId = uuidv4();

      // Create folder
      await db
        .insertInto('folders')
        .values({
          id: folderId,
          name,
          organization_id: organizationId,
          parent_folder_id: parentFolderId || null,
          path: parentFolderId ? `${parentFolderId}/${name}` : name,
          created_at: now,
          updated_at: now
        })
        .execute();

      const folder = await db
        .selectFrom('folders')
        .select([
          'id',
          'name',
          'path',
          'parent_folder_id',
          'created_at',
          'updated_at'
        ])
        .where('id', '=', folderId)
        .executeTakeFirst();

      res.status(201).json(folder);
    } catch (error) {
      console.error('Error creating folder:', error);
      res.status(500).json({ error: 'Error creating folder' });
    }
  }
);

/**
 * Delete a folder
 * 
 * @route DELETE /folders/:folderId
 */
router.delete(
  '/:folderId',
  authenticateToken,
  async (req, res) => {
    try {
      // First get the folder to check permissions
      const folder = await db
        .selectFrom('folders')
        .select(['organization_id'])
        .where('id', '=', req.params.folderId)
        .executeTakeFirst();

      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' });
      }

      // Verify user has access and role in this organization
      const hasAccess = await db
        .selectFrom('organization_members')
        .select(['user_id', 'role'])
        .where('organization_id', '=', folder.organization_id)
        .where('user_id', '=', req.user.id)
        .executeTakeFirst();

      if (!hasAccess) {
        return res.status(403).json({ error: 'No access to this folder' });
      }

      // Only allow deletion if user is owner/admin
      if (hasAccess.role !== 'owner' && hasAccess.role !== 'admin') {
        return res.status(403).json({ error: 'No permission to delete this folder' });
      }

      await db
        .deleteFrom('folders')
        .where('id', '=', req.params.folderId)
        .execute();

      res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
      console.error('Error deleting folder:', error);
      res.status(500).json({ error: 'Error deleting folder' });
    }
  }
);

export default router; 