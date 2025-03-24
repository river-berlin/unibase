import { Router, Request, Response } from 'express';
import Projects from '../../database/models/projects';
import Objects from '../../database/models/objects';

interface GetProjectCodeRequest extends Request {
  params: {
    projectId: string;
  };
}

const router = Router();

/**
 * Get all code objects for a project
 * 
 * @route GET /projects/:projectId/code
 */
router.get('/:projectId/code', async (req: GetProjectCodeRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Projects']
     #swagger.summary = 'Get all code objects for a project'
     #swagger.description = 'Retrieve all JavaScript objects associated with a project. If no objects exist, return an empty array.'
     #swagger.operationId = 'getProjectCode'
     #swagger.parameters = [{
       in: 'path',
       name: 'projectId',
       description: 'The ID of the project',
       required: true,
       type: 'string'
     }]
     #swagger.responses[200] = {
       description: 'Code objects retrieved successfully',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               objects: {
                 type: 'array',
                 description: 'An array of JavaScript objects',
                 items: {
                   type: 'object',
                   properties: {
                     id: { type: 'string', description: 'Object ID' },
                     object: { type: 'string', description: 'The JavaScript object content' },
                     created_at: { type: 'string', format: 'date-time', description: 'Timestamp when the object was created' },
                     updated_at: { type: 'string', format: 'date-time', description: 'Timestamp when the object was last updated' },
                     project_id: { type: 'string', description: 'ID of the project this object belongs to' }
                   }
                 }
               }
             }
           }
         }
       }
     } */

  if (!req.user?.userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const db = req.app.locals.db;
  
  // First get the project to check permissions
  const project = await Projects.findById(req.params.projectId, db);

  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  // Verify user has access to this project
  const hasAccess = await Projects.userHasAccess(req.params.projectId, req.user.userId, db);

  if (!hasAccess) {
    res.status(403).json({ error: 'No access to this project' });
    return;
  }

  // Get all objects for this project
  const objects = await Objects.findAllObjectsInProject(req.params.projectId, db);

  res.json({ objects });
});

export default router;
