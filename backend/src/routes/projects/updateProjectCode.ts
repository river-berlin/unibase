import { Router, Request, Response } from 'express';
import Projects from '../../database/models/projects';
import Objects from '../../database/models/objects';

interface UpdateProjectCodeRequest extends Request {
  params: {
    projectId: string;
  };
  body: {
    object: string;
    id?: string;
    filename?: string;
    filepath?: string;
  };
}

const router = Router();

/**
 * Update code object for a project
 * 
 * @route PUT /projects/:projectId/code
 */
router.put('/:projectId/code', async (req: UpdateProjectCodeRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Projects']
     #swagger.summary = 'Update code object for a project'
     #swagger.description = 'Update a JavaScript code object for a project. Creates a new object if id is not provided.'
     #swagger.operationId = 'updateProjectCode'
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
             required: ['object'],
             properties: {
               object: {
                 type: 'string',
                 description: 'The JavaScript code content'
               },
               id: {
                 type: 'string',
                 description: 'Optional ID of an existing object to update'
               },
               filename: {
                 type: 'string',
                 description: 'Optional filename for the code object'
               },
               filepath: {
                 type: 'string',
                 description: 'Optional filepath for the code object'
               }
             }
           }
         }
       }
     }
     #swagger.responses[200] = {
       description: 'Code object updated successfully',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               object: {
                 type: 'object',
                 properties: {
                   id: {
                     type: 'string',
                     description: 'The object ID'
                   },
                   object: {
                     type: 'string',
                     description: 'The JavaScript code content'
                   },
                   created_at: {
                     type: 'string',
                     format: 'date-time',
                     description: 'Creation timestamp'
                   },
                   updated_at: {
                     type: 'string',
                     format: 'date-time',
                     description: 'Last update timestamp'
                   },
                   project_id: {
                     type: 'string',
                     description: 'The project ID'
                   },
                   filename: {
                     type: 'string',
                     description: 'Filename of the object'
                   },
                   filepath: {
                     type: 'string',
                     description: 'Filepath of the object'
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

  try {
    let updatedObject;
    const objectId = req.body.id;

    if (objectId) {
      // Check if the object with this ID already exists
      const existingObject = await Objects.findById(objectId, db);
      
      if (existingObject) {
        // Update existing object if it exists
        updatedObject = await Objects.updateObject(objectId, {
          object: req.body.object,
          filename: req.body.filename,
          filepath: req.body.filepath
        }, db);
      } else {
        // Create a new object with the provided UUID if it doesn't exist
        updatedObject = await Objects.createObject({
          id: objectId, // Use the provided UUID
          object: req.body.object,
          project_id: req.params.projectId,
          filename: req.body.filename,
          filepath: req.body.filepath
        }, db);
      }
    } else {
      // Create a new object with a generated UUID if none is provided
      updatedObject = await Objects.createObject({
        object: req.body.object,
        project_id: req.params.projectId,
        filename: req.body.filename,
        filepath: req.body.filepath
      }, db);
    }

    res.json({ object: updatedObject });
  } catch (error) {
    console.error('Error updating code object:', error);
    res.status(500).json({ error: 'Failed to update code object' });
  }
});

export default router;
