import { Router, Request, Response } from 'express';
import Projects from '../../database/models/projects';
import Objects from '../../database/models/objects';

interface GetFileRequest extends Request {
  params: {
    projectId: string;
  };
  query: {
    filename: string;
    filepath?: string;
  };
}

const router = Router();

/**
 * Get a specific JS file from a project
 * 
 * @route GET /projects/:projectId/code/file
 */
router.get('/:projectId/code/file', async (req: GetFileRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Projects']
     #swagger.summary = 'Get a specific JS file from a project'
     #swagger.description = 'Retrieve a specific JavaScript file associated with a project by filename and optional filepath.'
     #swagger.operationId = 'getFile'
     #swagger.parameters = [
       {
         in: 'path',
         name: 'projectId',
         description: 'The ID of the project',
         required: true,
         type: 'string'
       },
       {
         in: 'query',
         name: 'filename',
         description: 'The filename of the JS file to retrieve',
         required: true,
         type: 'string'
       },
       {
         in: 'query',
         name: 'filepath',
         description: 'The filepath of the JS file (optional)',
         required: false,
         type: 'string'
       }
     ]
     #swagger.responses[200] = {
       description: 'JS file retrieved successfully',
       content: {
         'application/javascript': {
           schema: {
             type: 'string',
             description: 'The JavaScript file content'
           }
         }
       }
     }
     #swagger.responses[404] = {
       description: 'File not found'
     }
  */

    

  const { filename } = req.query;
  const filepath = req.query.filepath || '';
  
  if (!filename) {
    res.status(400).json({ error: 'Filename is required' });
    return;
  }

  const db = req.app.locals.db;
  
  // First get the project to check permissions
  const project = await Projects.findById(req.params.projectId, db);

  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  // Find the specific file
  const file = await Objects.findByFilenameAndPath(
    req.params.projectId,
    filename as string,
    filepath as string,
    db
  );

  if (!file) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  // Set appropriate content type for JavaScript
  res.setHeader('Content-Type', 'application/javascript');
  
  // Return just the file content
  res.send(file.object);
});

export default router;
