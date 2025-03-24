import { Router, Request, Response } from 'express';
import Projects from '../../database/models/projects';
import Objects from '../../database/models/objects';

interface UpdateProjectScadRequest extends Request {
  params: {
    projectId: string;
  };
  body: {
    scad: string;
  };
}

const router = Router();

/**
 * Update SCAD object for a project
 * 
 * @route PUT /projects/:projectId/scad
 */
router.put('/:projectId/scad', async (req: UpdateProjectScadRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Projects']
     #swagger.summary = 'Update SCAD object for a project'
     #swagger.description = 'Update the SCAD object for a project. Creates a new object if none exists.'
     #swagger.operationId = 'updateProjectScad'
     #swagger.parameters = [{
       in: 'path',
       name: 'projectId',
       description: 'The ID of the project',
       required: true,
       type: 'string'
     }]
     #swagger.requestBody = {
       required: true,
       content: {
         'application/json': {
           schema: {
             type: 'object',
             required: ['scad'],
             properties: {
               scad: {
                 type: 'string',
                 description: 'The SCAD object content'
               }
             }
           }
         }
       }
     }
     #swagger.responses[200] = {
       description: 'SCAD object updated successfully',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               scad: {
                 type: 'string',
                 description: 'The updated SCAD object content'
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

  console.log("latest object", latestObject)

  if (latestObject) {
    // Update existing object
    const updatedObject = await Objects.updateObject(latestObject.id!, {
      object: req.body.scad
    }, db);
    res.json({ scad: updatedObject.object });
  } else {
    // Create new object if none exists
    const newObject = await Objects.createObject({
      object: req.body.scad,
      project_id: req.params.projectId
    }, db);
    res.json({ scad: newObject.object });
  }
});

export default router; 