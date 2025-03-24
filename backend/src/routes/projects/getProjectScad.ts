import { Router, Request, Response } from 'express';
import Projects from '../../database/models/projects';
import Objects from '../../database/models/objects';

interface GetProjectScadRequest extends Request {
  params: {
    projectId: string;
  };
}

const router = Router();

/**
 * Get latest SCAD object for a project from the messages table
 * 
 * @route GET /projects/:projectId/scad
 */
router.get('/:projectId/scad', async (req: GetProjectScadRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Projects']
     #swagger.summary = 'Get latest SCAD object for a project'
     #swagger.description = 'Get the latest SCAD object for a project. If no objects exist, return an empty string.'
     #swagger.operationId = 'getProjectScad'
     #swagger.parameters = [{
       in: 'path',
       name: 'projectId',
       description: 'The ID of the project',
       required: true,
       type: 'string'
     }]
     #swagger.responses[200] = {
       description: 'Latest SCAD object retrieved successfully',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               scad: {
                 type: 'string',
                 description: 'The SCAD object content. Empty string if no objects exist.'
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

  // Get the latest object for this project
  const latestObject = await Objects.findLatestByProject(req.params.projectId, db);

  if (!latestObject) {
    // Return empty SCAD if no objects exist yet
    res.json({ scad: '' });
    return;
  }

  res.json({ scad: latestObject.object });
});

export default router; 