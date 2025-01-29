import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';

interface GetFolderContentsRequest extends Request {
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

const router = Router();

/**
 * Get contents of a specific folder
 * 
 * @route GET /folders/:folderId/contents
 */
router.get(
  '/:folderId/contents',
  authenticateToken,
  async (req: GetFolderContentsRequest, res: Response): Promise<void> => {
    /* #swagger.tags = ['Folders']
       #swagger.summary = 'Get folder contents'
       #swagger.operationId = 'listFolderContentsAndProjects'
       #swagger.description = 'Retrieves all subfolders and projects within a specified folder'
       #swagger.security = [{
         "bearerAuth": []
       }]
       #swagger.parameters['folderId'] = {
         in: 'path',
         description: 'ID of the folder to get contents from',
         required: true,
         type: 'string',
         format: 'uuid'
       }
       #swagger.responses[200] = {
         description: 'Folder contents retrieved successfully',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 projects: {
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
                       description: {
                         type: 'string',
                         nullable: true
                       },
                       icon: {
                         type: 'string',
                         nullable: true
                       },
                       folder_id: {
                         type: 'string',
                         format: 'uuid'
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
                 },
                 subfolders: {
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
                         type: 'string'
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
                   example: 'Error retrieving folder contents'
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

      // Get all projects in the folder
      const projects = await db
        .selectFrom('projects')
        .innerJoin('users', 'users.id', 'projects.created_by')
        .select([
          'projects.id',
          'projects.name',
          'projects.description',
          'projects.icon',
          'projects.created_at',
          'projects.updated_at',
          'users.name as created_by_name'
        ])
        .where('projects.folder_id', '=', req.params.folderId)
        .where('projects.organization_id', '=', req.query.organizationId)
        .orderBy('projects.name')
        .execute();

      // Get all subfolders
      const subfolders = await db
        .selectFrom('folders')
        .select([
          'id',
          'name',
          'path',
          'created_at',
          'updated_at'
        ])
        .where('parent_folder_id', '=', req.params.folderId)
        .where('organization_id', '=', req.query.organizationId)
        .orderBy('name')
        .execute();

      res.json({
        projects,
        subfolders
      });
    } catch (error) {
      console.error('Error fetching folder contents:', error);
      res.status(500).json({ error: 'Error retrieving folder contents' });
    }
  }
);

export default router; 