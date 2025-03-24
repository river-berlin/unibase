import { Router, Request, Response } from 'express';
import OrganizationMembers from '../../database/models/organization-members';

interface GetProjectsRequest extends Request {
  params: {
    organizationId: string;
  };
}

const router = Router();

/**
 * Get user's projects in an organization
 * 
 * @route GET /projects/org/:organizationId
 */
router.get('/org/:organizationId', async (req: GetProjectsRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Projects']
     #swagger.summary = 'List organization projects'
     #swagger.operationId = 'listProjectsInOrganization'
     #swagger.description = 'Retrieves all projects in an organization with their folder information, ordered by folder path and name'
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
                 }
               }
             }
           }
         }
       }
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
  */
  if (!req.user?.userId) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const db = req.app.locals.db;

  // Verify user has access to this organization
  const hasAccess = await OrganizationMembers.isMember(req.params.organizationId, req.user.userId, db);

  if (!hasAccess) {
    res.status(403).json({ error: 'No access to this organization' });
    return;
  }

  // We need to extend the Projects model to include a method for getting projects with folder details
  // Let's use a raw query for now since we need to join with folders
  const query = `
    SELECT p.*, f.name as folder_name, f.path as folder_path
    FROM projects p
    LEFT JOIN folders f ON p.folder_id = f.id
    WHERE p.organization_id = ?
    ORDER BY f.path, p.name
  `;
  
  const projects = await db.all(query, [req.params.organizationId]);
  res.json(projects);
});

export default router; 