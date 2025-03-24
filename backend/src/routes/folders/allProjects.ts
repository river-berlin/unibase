import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import OrganizationMembers from '../../database/models/organization-members';
import { DB } from '../../database/db';

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
    if (!req.user?.userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const db = req.app.locals.db;

    // First verify user has access to this organization
    const organizationMembers = await OrganizationMembers.findByOrganization(req.params.organizationId, db);
    const hasAccess = organizationMembers.some(member => member.user_id === req.user?.userId);

    if (!hasAccess) {
      res.status(403).json({ error: 'No access to this organization' });
      return;
    }

    // Get all projects with folder details
    const projects = await getProjectsWithFolderDetails(req.params.organizationId, db);

    res.json(projects);
  }
);

/**
 * Helper function to get projects with folder details
 */
async function getProjectsWithFolderDetails(organizationId: string, db: DB) {
  const query = `
    SELECT 
      projects.id,
      projects.name,
      projects.description,
      projects.icon,
      projects.folder_id,
      projects.created_at,
      projects.updated_at,
      folders.name as folder_name,
      folders.path as folder_path
    FROM projects
    LEFT JOIN folders ON folders.id = projects.folder_id
    WHERE projects.organization_id = ?
    ORDER BY folders.path, projects.name
  `;
  
  return db.all(query, [organizationId]);
}

export default router; 