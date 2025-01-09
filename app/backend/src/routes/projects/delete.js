import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { db } from '../../database/db.js';

const router = Router();

/**
 * Delete project
 * 
 * @route DELETE /projects/:projectId
 */
router.delete('/:projectId', authenticateToken, async (req, res) => {
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
      .select(['user_id', 'role'])
      .where('organization_id', '=', project.organization_id)
      .where('user_id', '=', req.user.id)
      .executeTakeFirst();

    if (!hasAccess) {
      return res.status(403).json({ error: 'No access to this project' });
    }

    // Only allow deletion if user is owner/admin or created the project
    if (hasAccess.role !== 'owner' && hasAccess.role !== 'admin' && project.created_by !== req.user.id) {
      return res.status(403).json({ error: 'No permission to delete this project' });
    }

    await db
      .deleteFrom('projects')
      .where('id', '=', req.params.projectId)
      .execute();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Error deleting project' });
  }
});

export default router; 