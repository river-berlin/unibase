import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { Database } from '../../database/types';
import { Transaction } from 'kysely';

interface DeleteProjectRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
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
router.delete('/:projectId', authenticateToken, async (req: DeleteProjectRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Projects']
     #swagger.summary = 'Delete project'
     #swagger.operationId = 'deleteProjectAndAssociatedData'
     #swagger.description = 'Deletes a project and all its associated data (conversations, messages) in a transaction'
     #swagger.security = [{
       "bearerAuth": []
     }]
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
     #swagger.responses[401] = {
       description: 'Unauthorized - Missing or invalid token'
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
     #swagger.responses[500] = {
       description: 'Server error',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               error: {
                 type: 'string',
                 example: 'Error deleting project'
               }
             }
           }
         }
       }
     }
  */
  try {
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

    // Start transaction for deletion
    await db.transaction().execute(async (trx: Transaction<Database>) => {
      // Delete associated messages first
      await trx
        .deleteFrom('messages')
        .where('conversation_id', 'in', 
          trx.selectFrom('conversations')
            .select('id')
            .where('project_id', '=', req.params.projectId)
        )
        .execute();

      // Delete associated conversations
      await trx
        .deleteFrom('conversations')
        .where('project_id', '=', req.params.projectId)
        .execute();

      // Delete the project
      await trx
        .deleteFrom('projects')
        .where('id', '=', req.params.projectId)
        .execute();
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Error deleting project' });
  }
});

export default router; 