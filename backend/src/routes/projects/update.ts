import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Projects from '../../database/models/projects';
import Folders from '../../database/models/folders';

interface UpdateProjectRequest extends Request {
  params: {
    projectId: string;
  };
  body: {
    name?: string;
    description?: string;
    icon?: string;
    folder_id?: string | null;
    use_for_training?: boolean;
    already_trained?: boolean;
    trained_at?: string;
  };
}

const router = Router();

/**
 * Update a project
 * 
 * @route PUT /projects/:projectId
 */
router.put(
  '/:projectId',
  [
    body('name').optional().trim().isLength({ min: 1 }).withMessage('Name cannot be empty'),
    body('description').optional().trim(),
    body('icon').optional().trim().isLength({ min: 1 }).withMessage('Icon cannot be empty'),
    body('folder_id').optional().isString().withMessage('Invalid folder ID'),
    body('use_for_training').optional().isBoolean().withMessage('use_for_training must be a boolean'),
    body('already_trained').optional().isBoolean().withMessage('already_trained must be a boolean'),
    body('trained_at').optional().isString().withMessage('trained_at must be a string')
  ],
  async (req: UpdateProjectRequest, res: Response): Promise<void> => {
    /* #swagger.tags = ['Projects']
       #swagger.summary = 'Update project details'
       #swagger.operationId = 'updateProjectAttributes'
       #swagger.description = 'Updates project information including name, description, icon, folder location, and training status'
       #swagger.parameters['projectId'] = {
         in: 'path',
         description: 'ID of the project to update',
         required: true,
         type: 'string',
         format: 'uuid'
       }
       #swagger.requestBody = {
         required: true,
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 name: {
                   type: 'string',
                   minLength: 1,
                   example: 'Updated Project Name'
                 },
                 description: {
                   type: 'string',
                   example: 'Updated project description'
                 },
                 icon: {
                   type: 'string',
                   minLength: 1,
                   example: 'cube'
                 },
                 folder_id: {
                   type: 'string',
                   format: 'uuid',
                   nullable: true,
                   description: 'New folder ID or null to move to root'
                 },
                 use_for_training: {
                   type: 'boolean',
                   description: 'Whether to use this project for training data',
                   example: true
                 },
                 already_trained: {
                   type: 'boolean',
                   description: 'Whether this project has been used as training data',
                   example: false
                 },
                 trained_at: {
                   type: 'string',
                   description: 'Timestamp when the project was used for training',
                   example: '2025-04-05T10:30:00Z'
                 }
               }
             }
           }
         }
       }
       #swagger.responses[200] = {
         description: 'Project updated successfully',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 id: {
                   type: 'string',
                   format: 'uuid'
                 },
                 name: {
                   type: 'string'
                 },
                 description: {
                   type: 'string',
                   nullable: true
                 },
                 icon: {
                   type: 'string'
                 },
                 folder_id: {
                   type: 'string',
                   format: 'uuid',
                   nullable: true
                 },
                 created_at: {
                   type: 'string',
                   format: 'date-time'
                 },
                 updated_at: {
                   type: 'string',
                   format: 'date-time'
                 },
                 folder_name: {
                   type: 'string',
                   nullable: true
                 },
                 folder_path: {
                   type: 'string',
                   nullable: true
                 },
                 use_for_training: {
                   type: 'boolean',
                   description: 'Whether this project is used for training data'
                 }
               }
             }
           }
         }
       }
       #swagger.responses[400] = {
         description: 'Validation error or invalid folder',
         content: {
           'application/json': {
             schema: {
               oneOf: [
                 {
                   type: 'object',
                   properties: {
                     errors: {
                       type: 'array',
                       items: {
                         type: 'object',
                         properties: {
                           msg: { type: 'string' },
                           param: { type: 'string' },
                           location: { type: 'string' }
                         }
                       }
                     }
                   }
                 },
                 {
                   type: 'object',
                   properties: {
                     error: {
                       type: 'string',
                       example: 'Folder not found'
                     }
                   }
                 }
               ]
             }
           }
         }
       }
       #swagger.responses[403] = {
         description: 'No access to project or folder',
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

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

    // If folder_id is provided, verify it exists and belongs to the same organization
    if (req.body.folder_id) {
      const folder = await Folders.findById(req.body.folder_id, db);

      if (!folder) {
        res.status(400).json({ error: 'Folder not found' });
        return;
      }

      if (folder.organization_id !== project.organization_id) {
        res.status(403).json({ error: 'Folder belongs to a different organization' });
        return;
      }
    }

    // Update the project
    const updateData: Partial<typeof project> = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.icon !== undefined) updateData.icon = req.body.icon;
    if (req.body.folder_id !== undefined) updateData.folder_id = req.body.folder_id;
    if (req.body.use_for_training !== undefined) updateData.use_for_training = req.body.use_for_training ? 1 : 0;
    if (req.body.already_trained !== undefined) updateData.already_trained = req.body.already_trained;
    if (req.body.trained_at !== undefined) updateData.trained_at = req.body.trained_at;

    // Update project using the Projects model
    await Projects.updateProject(
      req.params.projectId,
      updateData,
      req.user.userId,
      db
    );

    // Get updated project with folder details
    const projectWithDetails = await Projects.findByIdWithDetails(req.params.projectId, db);
    res.json(projectWithDetails);
  }
);

export default router; 