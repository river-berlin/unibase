import { Router, Request, Response } from 'express';
import Projects from '../../database/models/projects';
import Objects from '../../database/models/objects';

interface DeleteProjectCodeRequest extends Request {
  params: {
    objectId: string;
  };
}

const router = Router();

/**
 * Delete code object for a project
 * 
 * @route DELETE /projects/code/:objectId
 */
router.delete('/code/:objectId', async (req: DeleteProjectCodeRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Projects']
     #swagger.summary = 'Delete code object for a project'
     #swagger.operationId = 'deleteProjectCode'
     #swagger.description = 'Deletes a JavaScript code object from a project. Requires project access permissions.'
     #swagger.parameters['objectId'] = {
       in: 'path',
       description: 'ID of the code object to delete',
       required: true,
       type: 'string',
       format: 'uuid'
     }
     #swagger.responses[200] = {
       description: 'Code object deleted successfully',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               message: {
                 type: 'string',
                 example: 'Code object deleted successfully'
               }
             }
           }
         }
       }
     }
     #swagger.responses[401] = {
       description: 'User not authenticated',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               error: {
                 type: 'string',
                 example: 'Unauthorized'
               }
             }
           }
         }
       }
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
                 example: 'No access to this project'
               }
             }
           }
         }
       }
     }
     #swagger.responses[404] = {
       description: 'Code object not found',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               error: {
                 type: 'string',
                 example: 'Code object not found'
               }
             }
           }
         }
       }
     }
  */

  if (!req.user?.userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const db = req.app.locals.db;

  try {
    // First get the object to check if it exists and get its project ID
    const object = await Objects.findById(req.params.objectId, db);
    
    if (!object) {
      res.status(404).json({ error: 'Code object not found' });
      return;
    }

    // Get the project to check permissions
    const project = await Projects.findById(object.project_id, db);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Verify user has access to this project
    const hasAccess = await Projects.userHasAccess(object.project_id, req.user.userId, db);

    if (!hasAccess) {
      res.status(403).json({ error: 'No access to this project' });
      return;
    }

    // Delete the object
    const deleted = await Objects.deleteObject(req.params.objectId, db);
    
    if (!deleted) {
      res.status(500).json({ error: 'Failed to delete code object' });
      return;
    }

    res.status(200).json({ message: 'Code object deleted successfully' });
  } catch (error) {
    console.error('Error deleting code object:', error);
    res.status(500).json({ error: 'Failed to delete code object' });
  }
});

export default router; 