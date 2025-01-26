import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';

interface CreateProjectRequest extends Request {
  body: {
    name: string;
    description?: string;
    organizationId: string;
    folderId?: string;
  };
}

const router = Router();

/**
 * Create a new project
 * 
 * @route POST /projects
 * @param {string} name - Project name
 * @param {string} organizationId - Organization ID
 * @param {string} [description] - Optional project description
 * @param {string} [folderId] - Optional folder ID
 * 
 * @returns {Object} 201 - Created project
 * @returns {Object} 400 - Validation error
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden
 * @returns {Object} 500 - Server error
 */
router.post('/',
  authenticateToken,
  [
    body('name').notEmpty().trim(),
    body('organizationId').notEmpty(),
    body('description').optional().trim(),
    body('folderId').optional()
  ],
  async (req: CreateProjectRequest, res: Response): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { name, description, organizationId, folderId } = req.body;
      const db = req.app.locals.db;

      // Verify user has access to this organization
      const hasAccess = await db
        .selectFrom('organization_members')
        .select('user_id')
        .where('organization_id', '=', organizationId)
        .where('user_id', '=', req.user!.userId)
        .executeTakeFirst();

      if (!hasAccess) {
        res.status(403).json({ error: 'No access to this organization' });
        return;
      }

      // If folderId is provided, verify it exists and user has access to it
      if (folderId) {
        const folder = await db
          .selectFrom('folders')
          .select('organization_id')
          .where('id', '=', folderId)
          .executeTakeFirst();

        if (!folder) {
          res.status(400).json({ error: 'Folder not found' });
          return;
        }

        if (folder.organization_id !== organizationId) {
          res.status(403).json({ error: 'Folder does not belong to the specified organization' });
          return;
        }
      }

      const now = new Date().toISOString();
      const projectId = uuidv4();

      // Create project
      await db
        .insertInto('projects')
        .values({
          id: projectId,
          name,
          description: description || null,
          organization_id: organizationId,
          folder_id: folderId || null,
          icon: 'default',
          created_by: req.user!.userId,
          last_modified_by: req.user!.userId,
          created_at: now,
          updated_at: now
        })
        .execute();

      const project = await db
        .selectFrom('projects')
        .select([
          'id',
          'name',
          'description',
          'folder_id',
          'icon',
          'created_at',
          'updated_at'
        ])
        .where('id', '=', projectId)
        .executeTakeFirst();

      res.status(201).json(project);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Error creating project' });
    }
  }
);

export default router; 