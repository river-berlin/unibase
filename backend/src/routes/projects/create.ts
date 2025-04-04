import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Projects, { ProjectData } from '../../database/models/projects';
import OrganizationMembers from '../../database/models/organization-members';
import Folders from '../../database/models/folders';
import Conversations from '../../database/models/conversations';
import { DB } from '../../database/db';
import { v4 as uuidv4 } from 'uuid';

interface CreateProjectRequest extends Request {
  body: {
    name: string;
    description?: string;
    organizationId: string;
    folderId?: string;
  };
}

const router = Router();

/**
 * Create a new project
 * 
 * @route POST /projects
 * @param {string} name - Project name
 * @param {string} organizationId - Organization ID
 * @param {string} [description] - Optional project description
 * @param {string} [folderId] - Optional folder ID
 * 
 * @returns {Object} 201 - Created project
 * @returns {Object} 400 - Validation error
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden
 * @returns {Object} 500 - Server error
 */
router.post('/',
  [
    body('name').notEmpty().trim(),
    body('organizationId').notEmpty(),
    body('description').optional().trim(),
    body('folderId').optional()
  ],
  async (req: CreateProjectRequest, res: Response): Promise<void> => {
    /* #swagger.tags = ['Projects']
       #swagger.summary = 'Create new project'
       #swagger.operationId = 'createProjectWithConversation'
       #swagger.description = 'Creates a new project in an organization with an optional folder, and initializes a default conversation.'
       #swagger.requestBody = {
         required: true,
         content: {
           'application/json': {
             schema: {
               type: 'object',
               required: ['name', 'organizationId'],
               properties: {
                 name: {
                   type: 'string',
                   example: 'My New Project'
                 },
                 organizationId: {
                   type: 'string',
                   format: 'uuid',
                   description: 'ID of the organization to create the project in'
                 },
                 description: {
                   type: 'string',
                   example: 'A detailed description of my project'
                 },
                 folderId: {
                   type: 'string',
                   format: 'uuid',
                   description: 'Optional folder ID to place the project in'
                 }
               }
             }
           }
         }
       }
       #swagger.responses[201] = {
         description: 'Project created successfully',
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
                 folder_id: {
                   type: 'string',
                   format: 'uuid',
                   nullable: true
                 },
                 icon: {
                   type: 'string'
                 },
                 created_at: {
                   type: 'string',
                   format: 'date-time'
                 },
                 updated_at: {
                   type: 'string',
                   format: 'date-time'
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
         description: 'No access to organization or folder',
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
    */
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.user?.userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { name, description, organizationId, folderId } = req.body;
    const db = req.app.locals.db;

    // Verify user has access to this organization
    const hasAccess = await OrganizationMembers.isMember(organizationId, req.user.userId, db);

    if (!hasAccess) {
      res.status(403).json({ error: 'No access to this organization' });
      return;
    }

    // If folderId is provided, verify it exists and user has access to it
    if (folderId) {
      const folder = await Folders.findById(folderId, db);

      if (!folder) {
        res.status(400).json({ error: 'Folder not found' });
        return;
      }

      if (folder.organization_id !== organizationId) {
        res.status(403).json({ error: 'Folder does not belong to the specified organization' });
        return;
      }
    }

    // Create project using the Projects model
    const projectData: ProjectData = {
      name,
      description: description || null,
      organization_id: organizationId,
      folder_id: folderId || null,
      icon: 'default',
      created_by: req.user.userId
    };

    // Use a transaction to create both the project and conversation
    const project = await db.transaction(async (tx : DB) => {
      // Create the project
      const newProject = await Projects.createProject(projectData, tx);
      
      // Create default conversation for the project
      await Conversations.createConversation({
        id : uuidv4(),
        project_id: newProject.id as string,
        model: process.env.LLM_MODEL as string,
        status: 'active',
        updated_at: new Date().toISOString()
      }, tx);
      
      return newProject;
    });

    res.status(201).json(project);
  });

export default router; 