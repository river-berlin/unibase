import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';

interface GetProjectsRequest extends Request {
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
 * Get all projects in an organization
 * 
 * @route GET /folders/projects/org/:organizationId
 */
router.get(
  '/projects/org/:organizationId',
  authenticateToken,
  async (req: GetProjectsRequest, res: Response): Promise<void> => {
    /* #swagger.tags = ['Folders']
       #swagger.summary = 'Get all projects in organization'
       #swagger.operationId = 'listAllProjectsInOrganization'
       #swagger.description = 'Retrieves all projects in an organization, ordered by folder path and project name'
       #swagger.security = [{
         "bearerAuth": []
       }]
       #swagger.parameters['organizationId'] = {
         in: 'path',
         description: 'ID of the organization to list projects from',
         required: true,
         type: 'string',
         format: 'uuid'
       }
       #swagger.responses[200] = {
         description: 'Projects retrieved successfully',
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
                     nullable: true,
                     description: 'Name of the folder containing the project'
                   },
                   folder_path: {
                     type: 'string',
                     nullable: true,
                     description: 'Full path of the folder containing the project'
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
                   example: 'Error fetching projects'
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

      const projects = await db
        .selectFrom('projects')
        .leftJoin('folders', 'folders.id', 'projects.folder_id')
        .select([
          'projects.id',
          'projects.name',
          'projects.description',
          'projects.icon',
          'projects.folder_id',
          'projects.created_at',
          'projects.updated_at',
          'folders.name as folder_name',
          'folders.path as folder_path'
        ])
        .where('projects.organization_id', '=', req.params.organizationId)
        .orderBy(['folders.path', 'projects.name'])
        .execute();

      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Error fetching projects' });
    }
  }
);

export default router; 