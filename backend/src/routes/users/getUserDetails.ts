import { Router, Request, Response } from 'express';
import Users from '../../database/models/users.js';
import OrganizationMembers from '../../database/models/organization-members.js';
import Organization from '../../database/models/organizations.js';

// No need to redefine the interface since it's already in Express namespace
const router = Router();

/**
 * Get authenticated user's details
 * 
 * @route GET /users/me
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  /* #swagger.tags = ['Users']
     #swagger.summary = 'Get user details'
     #swagger.operationId = 'getUserDetailsWithOrganizations'
     #swagger.description = 'Retrieves authenticated user details including organizations and roles'
     
     #swagger.responses[200] = {
       description: 'User details retrieved successfully',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               id: {
                 type: 'string',
                 format: 'uuid'
               },
               email: {
                 type: 'string',
                 format: 'email'
               },
               name: {
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
               last_login_at: {
                 type: 'string',
                 format: 'date-time',
                 nullable: true
               },
               organizations: {
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
                     role: {
                       type: 'string',
                       enum: ['owner', 'admin', 'member']
                     }
                   }
                 }
               }
             }
           }
         }
       }
     }
  */
    if (!req.user?.userId) {
      res.status(401).json({
        error: 'User not authenticated'
      });
      return;
    }

    const db = req.app.locals.db;
    
    // Get user details using the Users model
    const user = await Users.findById(req.user.userId, db);

    if (!user) {
      res.status(404).json({error: 'User not found'});
      return;
    }

    console.log("all organizations", await OrganizationMembers.findAll());
    
    // Get user's organizations
    const organizations = await Organization.findByUser(user.id, db);
    
    // Format the response with explicit keys
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login_at: user.last_login_at,
      organizations : organizations
    });
});

export default router;
