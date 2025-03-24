import { Router, Request, Response } from 'express';
import Projects from '../../database/models/projects';
import Objects from '../../database/models/objects';
import { scadToStl } from '../../craftstool/openscad';

interface GetProjectStlRequest extends Request {
  params: {
    projectId: string;
  };
}

const router = Router();

/**
 * Get latest STL for a project from the messages table
 * 
 * @route GET /projects/:projectId/stl
 */
router.get('/:projectId/stl', async (req: GetProjectStlRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Projects']
     #swagger.summary = 'Get latest STL for a project'
     #swagger.description = 'Get the latest STL for a project. If no objects exist, return an empty string.'
     #swagger.operationId = 'getProjectStl'
     #swagger.parameters = [{
       in: 'path',
       name: 'projectId',
       description: 'The ID of the project',
       required: true,
       type: 'string'
     }]
     #swagger.responses[200] = {
       description: 'Latest STL retrieved successfully',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               stl: {
                 type: 'string',
                 description: 'The STL content. Empty string if no objects exist.'
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
    // Return empty STL if no objects exist yet
    res.json({ stl: '' });
    return;
  }

  // Convert SCAD to STL
  try {
    const stlData = await scadToStl(latestObject.object);
    res.json({ stl: stlData });
  } catch (error) {
    console.error('Error converting SCAD to STL:', error);
    res.status(500).json({ error: 'Error converting SCAD to STL' });
  }
});

export default router; 