import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';

interface GetFoldersRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
  params: {
    organizationId: string;
  };
}

const router = Router();

/**
 * Get all folders accessible to the user in an organization
 * 
 * @route GET /folders/org/:organizationId
 */
router.get(
  '/org/:organizationId',
  authenticateToken,
  async (req: GetFoldersRequest, res: Response): Promise<void> => {
    /* #swagger.tags = ['Folders']
       #swagger.summary = 'Get all folders in organization'
       #swagger.operationId = 'listAllFoldersInOrganization'
       #swagger.description = 'Retrieves all folders in an organization, ordered by folder path'
       #swagger.security = [{
         "bearerAuth": []
       }]
       #swagger.parameters['organizationId'] = {
         in: 'path',
         description: 'ID of the organization to list folders from',
         required: true,
         type: 'string',
         format: 'uuid'
       }
       #swagger.responses[200] = {
         description: 'Folders retrieved successfully',
         content: {
           'application/json': {
             schema: {
               type: 'array',
               items: {
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
       #swagger.responses[500] = {
         description: 'Server error',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 error: {
                   type: 'string',
                   example: 'Error fetching folders'
                 }
               }
             }
           }
         }
       }
    */
    try {
      if (!req.user?.userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const db = req.app.locals.db;

      // First verify user has access to this organization
      const hasAccess = await db
        .selectFrom('organization_members')
        .select('user_id')
        .where('organization_id', '=', req.params.organizationId)
        .where('user_id', '=', req.user.userId)
        .executeTakeFirst();

      if (!hasAccess) {
        res.status(403).json({ error: 'No access to this organization' });
        return;
      }

      const folders = await db
        .selectFrom('folders')
        .select([
          'folders.id',
          'folders.name',
          'folders.path',
          'folders.parent_folder_id',
          'folders.created_at',
          'folders.updated_at'
        ])
        .where('folders.organization_id', '=', req.params.organizationId)
        .orderBy('folders.path')
        .execute();

      res.json(folders);
    } catch (error) {
      console.error('Error fetching folders:', error);
      res.status(500).json({ error: 'Error fetching folders' });
    }
  }
);

export default router; 