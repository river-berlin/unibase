import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { db } from '../../database/db.js';

const router = Router();

/**
 * Update project
 * 
 * @route PATCH /projects/:projectId
 */
router.patch('/:projectId', authenticateToken, async (req, res) => {
  const { name, description, folderId } = req.body;

  try {
    // First get the project to check permissions
    const project = await db
      .selectFrom('projects')
      .select(['organization_id', 'created_by'])
      .where('id', '=', req.params.projectId)
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

    // Update project
    await db
      .updateTable('projects')
      .set({
        name: name || undefined,
        description: description || undefined,
        folder_id: folderId || null,
        last_modified_by: req.user.id,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', req.params.projectId)
      .execute();

    const updatedProject = await db
      .selectFrom('projects')
      .select([
        'id',
        'name',
        'description',
        'folder_id',
        'icon',
        'updated_at'
      ])
      .where('id', '=', req.params.projectId)
      .executeTakeFirst();

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Error updating project' });
  }
});

export default router; 