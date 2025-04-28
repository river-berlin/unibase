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

interface GetDevFileRequest extends Request {
  params: {
    workspaceName: string;
    projectName?: string;
    filename?: string;
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

/**
 * Get a file from a workspace/project using the dev endpoint pattern
 * 
 * @route GET /projects/code/:workspaceName/:projectName/dev
 * Returns index.js from the specified project
 */
router.get('/code/:workspaceName/:projectName/dev', async (req: GetDevFileRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Projects']
     #swagger.summary = 'Get index.js from a project in a workspace'
     #swagger.description = 'Retrieve the index.js file from a specified project in a workspace.'
     #swagger.operationId = 'getProjectIndexByWorkspaceAndProject'
     #swagger.parameters = [
       {
         in: 'path',
         name: 'workspaceName',
         description: 'The name of the workspace',
         required: true,
         type: 'string'
       },
       {
         in: 'path',
         name: 'projectName',
         description: 'The name of the project',
         required: true,
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
       description: 'Workspace, project, or file not found'
     }
  */
  const { workspaceName, projectName } = req.params;
  
  // Find the organization by workspace name
  const query = `SELECT * FROM organizations WHERE name = ? LIMIT 1`;
  const organization = await req.app.locals.db.get(query, [workspaceName]);
  
  if (!organization) {
    res.status(404).json({ error: 'Workspace not found' });
    return;
  }
  
  // Find the project by name in this organization
  const projects = await Projects.findByOrganization(organization.id as string, req.app.locals.db);
  const project = projects.find((p: { name: string }) => p.name === projectName);
  
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  
  // Find the index.js file in this project
  const file = await Objects.findByFilenameAndPath(
    project.id as string,
    'index.js',
    '',
    req.app.locals.db
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

/**
 * Get a specific file from a workspace/project using the dev endpoint pattern
 * 
 * @route GET /code/:workspaceName/:projectName/:filename@dev.js
 * Returns the specified file from the project
 */
router.get('/code/:workspaceName/:projectName/:filename@dev.js', async (req: GetDevFileRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Projects']
     #swagger.summary = 'Get a specific file from a project in a workspace'
     #swagger.description = 'Retrieve a specific JavaScript file from a project in a workspace using the @dev.js suffix.'
     #swagger.operationId = 'getProjectFileByWorkspaceAndProject'
     #swagger.parameters = [
       {
         in: 'path',
         name: 'workspaceName',
         description: 'The name of the workspace',
         required: true,
         type: 'string'
       },
       {
         in: 'path',
         name: 'projectName',
         description: 'The name of the project',
         required: true,
         type: 'string'
       },
       {
         in: 'path',
         name: 'filename',
         description: 'The filename to retrieve (without .js extension)',
         required: true,
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
       description: 'Workspace, project, or file not found'
     }
  */
  const { workspaceName, projectName, filename } = req.params;
  
  // Extract the actual filename without the @dev.js suffix
  const actualFilename = filename?.replace('@dev.js', '') || '';
  
  if (!actualFilename) {
    res.status(400).json({ error: 'Filename is required' });
    return;
  }
  
  // Find the organization by workspace name
  const query = `SELECT * FROM organizations WHERE name = ? LIMIT 1`;
  const organization = await req.app.locals.db.get(query, [workspaceName]);
  
  if (!organization) {
    res.status(404).json({ error: 'Workspace not found' });
    return;
  }
  
  // Find the project by name in this organization
  const projects = await Projects.findByOrganization(organization.id as string, req.app.locals.db);
  const project = projects.find((p: { name: string }) => p.name === projectName);
  
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  
  // Find the specific file in this project
  const file = await Objects.findByFilenameAndPath(
    project.id as string,
    `${actualFilename}.js`,
    '',
    req.app.locals.db
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

/**
 * Get the default project's index.js file from a workspace
 * 
 * @route GET /code/:workspaceName/dev
 * Returns index.js from the project named 'index' in the specified workspace
 */
router.get('/code/:workspaceName/dev', async (req: GetDevFileRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Projects']
     #swagger.summary = 'Get index.js from the default project in a workspace'
     #swagger.description = 'Retrieve the index.js file from the project named "index" in the specified workspace.'
     #swagger.operationId = 'getDefaultProjectIndexByWorkspace'
     #swagger.parameters = [
       {
         in: 'path',
         name: 'workspaceName',
         description: 'The name of the workspace',
         required: true,
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
       description: 'Workspace, default project, or file not found'
     }
  */
  const { workspaceName } = req.params;
  
  // Find the organization by workspace name
  const query = `SELECT * FROM organizations WHERE name = ? LIMIT 1`;
  const organization = await req.app.locals.db.get(query, [workspaceName]);
  
  if (!organization) {
    res.status(404).json({ error: 'Workspace not found' });
    return;
  }
  
  // Find the project named 'index' in this organization
  const projects = await Projects.findByOrganization(organization.id as string, req.app.locals.db);
  const project = projects.find((p: { name: string }) => p.name === 'index');
  
  if (!project) {
    res.status(404).json({ error: 'Default project not found' });
    return;
  }
  
  // Find the index.js file in this project
  const file = await Objects.findByFilenameAndPath(
    project.id as string,
    'index.js',
    '',
    req.app.locals.db
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
