import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { Transaction } from 'kysely';
import { Database } from '../../database/types';

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
  authenticateToken,
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
       #swagger.security = [{
         "bearerAuth": []
       }]
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
       #swagger.responses[401] = {
         description: 'Unauthorized - Missing or invalid token'
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
       #swagger.responses[500] = {
         description: 'Server error',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 error: {
                   type: 'string',
                   example: 'Error creating project'
                 }
               }
             }
           }
         }
       }
    */
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { name, description, organizationId, folderId } = req.body;
      const db = req.app.locals.db;

      // Verify user has access to this organization
      const hasAccess = await db
        .selectFrom('organization_members')
        .select('user_id')
        .where('organization_id', '=', organizationId)
        .where('user_id', '=', req.user!.userId)
        .executeTakeFirst();

      if (!hasAccess) {
        res.status(403).json({ error: 'No access to this organization' });
        return;
      }

      // If folderId is provided, verify it exists and user has access to it
      if (folderId) {
        const folder = await db
          .selectFrom('folders')
          .select('organization_id')
          .where('id', '=', folderId)
          .executeTakeFirst();

        if (!folder) {
          res.status(400).json({ error: 'Folder not found' });
          return;
        }

        if (folder.organization_id !== organizationId) {
          res.status(403).json({ error: 'Folder does not belong to the specified organization' });
          return;
        }
      }

      const now = new Date().toISOString();
      const projectId = uuidv4();

      // Start transaction for creation
      const project = await db.transaction().execute(async (trx: Transaction<Database>) => {
        // Create project
        await trx
          .insertInto('projects')
          .values({
            id: projectId,
            name,
            description: description || null,
            organization_id: organizationId,
            folder_id: folderId || null,
            icon: 'default',
            created_by: req.user!.userId,
            last_modified_by: req.user!.userId,
            created_at: now,
            updated_at: now
          })
          .execute();

        // Create default conversation for the project
        await trx
          .insertInto('conversations')
          .values({
            id: uuidv4(),
            project_id: projectId,
            model: process.env.OPENAI_BASE_URL + '--' + process.env.OPENAI_MODEL,
            status: 'active',
            updated_at: now
          })
          .execute();

        // Return the created project
        return await trx
          .selectFrom('projects')
          .select([
            'id',
            'name',
            'description',
            'folder_id',
            'icon',
            'created_at',
            'updated_at'
          ])
          .where('id', '=', projectId)
          .executeTakeFirst();
      });

      res.status(201).json(project);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Error creating project' });
    }
  }
);

export default router; 