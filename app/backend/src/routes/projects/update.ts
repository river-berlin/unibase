import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { body, validationResult } from 'express-validator';
import { Database } from '../../database/types';

interface UpdateProjectRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
  params: {
    projectId: string;
  };
  body: {
    name?: string;
    description?: string;
    icon?: string;
    folder_id?: string | null;
  };
}

const router = Router();

/**
 * Update a project
 * 
 * @route PUT /projects/:projectId
 */
router.put(
  '/:projectId',
  authenticateToken,
  [
    body('name').optional().trim().isLength({ min: 1 }).withMessage('Name cannot be empty'),
    body('description').optional().trim(),
    body('icon').optional().trim().isLength({ min: 1 }).withMessage('Icon cannot be empty'),
    body('folder_id').optional().isString().withMessage('Invalid folder ID')
  ],
  async (req: UpdateProjectRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

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

      // If folder_id is provided, verify it exists and belongs to the same organization
      if (req.body.folder_id) {
        const folder = await db
          .selectFrom('folders')
          .select('organization_id')
          .where('id', '=', req.body.folder_id)
          .executeTakeFirst();

        if (!folder) {
          res.status(400).json({ error: 'Folder not found' });
          return;
        }

        if (folder.organization_id !== project.organization_id) {
          res.status(403).json({ error: 'Folder belongs to a different organization' });
          return;
        }
      }

      // Update the project
      const updateData: Record<string, any> = {
        last_modified_by: req.user.userId,
        updated_at: new Date().toISOString()
      };

      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.icon !== undefined) updateData.icon = req.body.icon;
      if (req.body.folder_id !== undefined) updateData.folder_id = req.body.folder_id;

      await db
        .updateTable('projects')
        .set(updateData)
        .where('id', '=', req.params.projectId)
        .execute();

      // Get updated project
      const updatedProject = await db
        .selectFrom('projects')
        .leftJoin('folders', 'folders.id', 'projects.folder_id')
        .selectAll('projects')
        .select(['folders.name as folder_name', 'folders.path as folder_path'])
        .where('projects.id', '=', req.params.projectId)
        .executeTakeFirst();

      res.json(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: 'Error updating project' });
    }
  }
);

export default router; 