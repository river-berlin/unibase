import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';

interface GetFolderHierarchyRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
  params: {
    folderId: string;
  };
  query: {
    organizationId: string;
  };
}

interface FolderHierarchy {
  id: string;
  name: string;
  parent_folder_id: string | null;
}

const router = Router();

/**
 * Get folder hierarchy (path from root)
 * 
 * @route GET /folders/:folderId/hierarchy
 */
router.get(
  '/:folderId/hierarchy',
  authenticateToken,
  async (req: GetFolderHierarchyRequest, res: Response): Promise<void> => {
    /* #swagger.tags = ['Folders']
       #swagger.summary = 'Get folder hierarchy'
       #swagger.operationId = 'getFolderHierarchyPath'
       #swagger.description = 'Retrieves the complete folder hierarchy path from root to the specified folder'
       #swagger.security = [{
         "bearerAuth": []
       }]
       #swagger.parameters['folderId'] = {
         in: 'path',
         description: 'ID of the folder to get hierarchy for',
         required: true,
         type: 'string',
         format: 'uuid'
       }
       #swagger.parameters['organizationId'] = {
         in: 'query',
         description: 'ID of the organization the folder belongs to',
         required: true,
         type: 'string',
         format: 'uuid'
       }
       #swagger.responses[200] = {
         description: 'Folder hierarchy retrieved successfully',
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
                   parent_folder_id: {
                     type: 'string',
                     format: 'uuid',
                     nullable: true
                   }
                 }
               },
               description: 'Array of folders from root to target folder'
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
         description: 'Folder not found',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 error: {
                   type: 'string',
                   example: 'Folder not found'
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
                   example: 'Error fetching folder hierarchy'
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
        .where('organization_id', '=', req.query.organizationId)
        .where('user_id', '=', req.user.userId)
        .executeTakeFirst();

      if (!hasAccess) {
        res.status(403).json({ error: 'No access to this organization' });
        return;
      }

      const hierarchy: FolderHierarchy[] = [];
      let currentFolder = await db
        .selectFrom('folders')
        .select(['id', 'name', 'parent_folder_id'])
        .where('id', '=', req.params.folderId)
        .where('organization_id', '=', req.query.organizationId)
        .executeTakeFirst();

      while (currentFolder) {
        hierarchy.unshift(currentFolder);
        if (!currentFolder.parent_folder_id) break;

        currentFolder = await db
          .selectFrom('folders')
          .select(['id', 'name', 'parent_folder_id'])
          .where('id', '=', currentFolder.parent_folder_id)
          .where('organization_id', '=', req.query.organizationId)
          .executeTakeFirst();
      }

      res.json(hierarchy);
    } catch (error) {
      console.error('Error fetching folder hierarchy:', error);
      res.status(500).json({ error: 'Error fetching folder hierarchy' });
    }
  }
);

export default router; 