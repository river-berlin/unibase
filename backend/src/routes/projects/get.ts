import { Router, Request, Response } from 'express';
import Projects from '../../database/models/projects';
import OrganizationMembers from '../../database/models/organization-members';

interface Project {
  id: string;
  name: string;
  description: string | null;
  organization_id: string;
  folder_id: string | null;
  icon: string;
  created_at: string;
  updated_at: string;
  folder_name: string | null;
  folder_path: string | null;
  created_by_name: string;
}

interface GetProjectRequest extends Request {
  params: {
    projectId: string;
  };
}

const router = Router();

/**
 * Get single project
 * 
 * @route GET /projects/:projectId
 */
router.get('/:projectId', async (req: GetProjectRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Projects']
     #swagger.summary = 'Get project details'
     #swagger.operationId = 'getProjectWithFolderInfo'
     #swagger.description = 'Retrieves detailed project information including folder path and creator details'
     #swagger.parameters['projectId'] = {
       in: 'path',
       description: 'ID of the project to retrieve',
       required: true,
       type: 'string',
       format: 'uuid'
     }
     #swagger.responses[200] = {
       description: 'Project details retrieved successfully',
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
               organization_id: {
                 type: 'string',
                 format: 'uuid'
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
               },
               folder_name: {
                 type: 'string',
                 nullable: true
               },
               folder_path: {
                 type: 'string',
                 nullable: true
               },
               created_by_name: {
                 type: 'string'
               }
             }
           }
         }
       }
     }
     #swagger.responses[403] = {
       description: 'No access to project',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               error: {
                 type: 'string',
                 example: 'No access to this project'
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
  if (!req.user?.userId) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const db = req.app.locals.db;
  
  // Get project with details using the Projects model
  const project = await Projects.findByIdWithDetails(req.params.projectId, db);

  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  // Verify user has access to this project's organization
  const hasAccess = await Projects.userHasAccess(req.params.projectId, req.user.userId, db);

  if (!hasAccess) {
    res.status(403).json({ error: 'No access to this project' });
    return;
  }

  res.json(project);
});

export default router;