import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';

interface CreateFolderRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
  body: {
    name: string;
    organizationId: string;
    parentFolderId?: string;
  };
}

const router = Router();

/**
 * Create a new folder
 * 
 * @route POST /folders
 */
router.post(
  '/',
  [
    authenticateToken,
    body('name').trim().notEmpty(),
    body('organizationId').notEmpty()
  ],
  async (req: CreateFolderRequest, res: Response): Promise<void> => {
    /* #swagger.tags = ['Folders']
       #swagger.summary = 'Create new folder'
       #swagger.operationId = 'createFolderWithHierarchy'
       #swagger.description = 'Creates a new folder in an organization with optional parent folder, maintaining folder hierarchy and path'
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
                   minLength: 1,
                   example: 'My New Folder'
                 },
                 organizationId: {
                   type: 'string',
                   format: 'uuid',
                   description: 'ID of the organization to create the folder in'
                 },
                 parentFolderId: {
                   type: 'string',
                   format: 'uuid',
                   description: 'Optional parent folder ID for nesting (max depth: 4)',
                   nullable: true
                 }
               }
             }
           }
         }
       }
       #swagger.responses[201] = {
         description: 'Folder created successfully',
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
                 path: {
                   type: 'string',
                   description: 'Full path of the folder including parent folders'
                 },
                 parent_folder_id: {
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
                 }
               }
             }
           }
         }
       }
       #swagger.responses[400] = {
         description: 'Validation error or maximum nesting depth exceeded',
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
                       example: 'Maximum folder nesting depth (4) exceeded'
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
         description: 'No access to organization',
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
         description: 'Parent folder not found',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 error: {
                   type: 'string',
                   example: 'Parent folder not found'
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
                   example: 'Error creating folder'
                 }
               }
             }
           }
         }
       }
    */
    try {
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
      const { name, organizationId, parentFolderId } = req.body;

      // Verify user has access to this organization
      const hasAccess = await db
        .selectFrom('organization_members')
        .select('user_id')
        .where('organization_id', '=', organizationId)
        .where('user_id', '=', req.user.userId)
        .executeTakeFirst();

      if (!hasAccess) {
        res.status(403).json({ error: 'No access to this organization' });
        return;
      }

      // If parent folder specified, verify it exists and is in the same organization
      if (parentFolderId) {
        const parentFolder = await db
          .selectFrom('folders')
          .select(['id', 'path'])
          .where('id', '=', parentFolderId)
          .where('organization_id', '=', organizationId)
          .executeTakeFirst();

        if (!parentFolder) {
          res.status(404).json({ error: 'Parent folder not found' });
          return;
        }

        // Check folder hierarchy depth
        const hierarchyDepth = parentFolder.path.split('/').filter(Boolean).length;
        if (hierarchyDepth >= 4) {
          res.status(400).json({ error: 'Maximum folder nesting depth (4) exceeded' });
          return;
        }
      }

      const now = new Date().toISOString();
      const folderId = uuidv4();

      // Create folder
      await db
        .insertInto('folders')
        .values({
          id: folderId,
          name,
          organization_id: organizationId,
          parent_folder_id: parentFolderId || null,
          path: parentFolderId ? `${parentFolderId}/${name}` : name,
          created_at: now,
          updated_at: now
        })
        .execute();

      const folder = await db
        .selectFrom('folders')
        .select([
          'id',
          'name',
          'path',
          'parent_folder_id',
          'created_at',
          'updated_at'
        ])
        .where('id', '=', folderId)
        .executeTakeFirst();

      res.status(201).json(folder);
    } catch (error) {
      console.error('Error creating folder:', error);
      res.status(500).json({ error: 'Error creating folder' });
    }
  }
);

export default router; 