import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';

interface GetUserDetailsRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
}

const router = Router();

/**
 * Get authenticated user's details
 * 
 * @route GET /users/me
 */
router.get('/me', authenticateToken, async (req: GetUserDetailsRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Users']
     #swagger.summary = 'Get user details'
     #swagger.operationId = 'getUserDetailsWithOrganizations'
     #swagger.description = 'Retrieves authenticated user details including organizations and roles'
     #swagger.security = [{
       "bearerAuth": []
     }]
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
     #swagger.responses[401] = {
       description: 'Unauthorized - Missing or invalid token'
     }
     #swagger.responses[404] = {
       description: 'User not found',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               error: {
                 type: 'string',
                 example: 'User not found'
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
                 example: 'Error fetching user details'
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

    // Get user details
    const user = await db
      .selectFrom('users')
      .select([
        'id',
        'email',
        'name',
        'created_at',
        'updated_at',
        'last_login_at'
      ])
      .where('id', '=', req.user.userId)
      .executeTakeFirst();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get user's organizations and roles
    const organizations = await db
      .selectFrom('organization_members')
      .innerJoin('organizations', 'organizations.id', 'organization_members.organization_id')
      .select([
        'organizations.id',
        'organizations.name',
        'organization_members.role'
      ])
      .where('organization_members.user_id', '=', req.user.userId)
      .execute();

    // Combine user details with organizations
    const userDetails = {
      ...user,
      organizations
    };

    res.json(userDetails);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Error fetching user details' });
  }
});

export default router;
