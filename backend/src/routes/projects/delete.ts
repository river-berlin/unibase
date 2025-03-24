import { Router, Request, Response } from 'express';
import Projects from '../../database/models/projects';
import { DB } from '../../database/db';

interface DeleteProjectRequest extends Request {
  params: {
    projectId: string;
  };
}

const router = Router();

/**
 * Delete a project
 * 
 * @route DELETE /projects/:projectId
 */
router.delete('/:projectId', async (req: DeleteProjectRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Projects']
     #swagger.summary = 'Delete project'
     #swagger.operationId = 'deleteProjectAndAssociatedData'
     #swagger.description = 'Deletes a project and all its associated data (conversations, messages) in a transaction'
     #swagger.parameters['projectId'] = {
       in: 'path',
       description: 'ID of the project to delete',
       required: true,
       type: 'string',
       format: 'uuid'
     }
     #swagger.responses[204] = {
       description: 'Project deleted successfully'
     }
     #swagger.responses[403] = {
       description: 'No access to project',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               error: {
                 type: 'string',
                 example: 'No access to this organization'
               }
             }
           }
         }
       }
     }
     #swagger.responses[404] = {
       description: 'Project not found',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               error: {
                 type: 'string',
                 example: 'Project not found'
               }
             }
           }
         }
       }
     }
  */
  if (!req.user?.userId) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const db = req.app.locals.db;

  // Get project and verify it exists
  const project = await Projects.findById(req.params.projectId, db);

  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  // Verify user has access to this project
  const hasAccess = await Projects.userHasAccess(req.params.projectId, req.user.userId, db);

  if (!hasAccess) {
    res.status(403).json({ error: 'No access to this organization' });
    return;
  }

  // Start transaction for deletion
  await db.transaction(async (tx: DB) => {
    // Delete associated messages first
    await tx.run(`
      DELETE FROM messages 
      WHERE conversation_id IN (
        SELECT id FROM conversations WHERE project_id = ?
      )
    `, [req.params.projectId]);

    // Delete associated conversations
    await tx.run(`
      DELETE FROM conversations 
      WHERE project_id = ?
    `, [req.params.projectId]);

    // Delete the project
    await tx.run(`
      DELETE FROM projects 
      WHERE id = ?
    `, [req.params.projectId]);
  });

  res.status(204).send();
});

export default router; 