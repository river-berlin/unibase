/**
 * @swagger
 * tags:
 *   name: Health Check
 *   description: API health check and authentication test endpoints
 */

import { Router } from 'express';
import { authenticateToken, isAdmin } from '../../middleware/auth';

const router = Router();


router.get('/', (req, res) => {
  /* #swagger.tags = ['Health Check']
     #swagger.summary = 'Basic health check'
     #swagger.operationId = 'ping'
     #swagger.description = 'Returns a simple pong response to verify the API is running'
     #swagger.responses[200] = {
       description: 'API is running',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               message: {
                 type: 'string',
                 example: 'pong'
               }
             }
           }
         }
       }
     }
  */
  res.json({ message: 'pong' });
});


router.get('/auth', authenticateToken, (req, res) => {
  /* #swagger.tags = ['Health Check']
     #swagger.summary = 'Authentication check'
     #swagger.operationId = 'pingAuth'
     #swagger.description = 'Verifies that the authentication token is valid and returns user information'
     #swagger.security = [{
       "bearerAuth": []
     }]
     #swagger.responses[200] = {
       description: 'Token is valid',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               message: {
                 type: 'string',
                 example: 'authenticated pong'
               },
               user: {
                 type: 'object',
                 properties: {
                   userId: {
                     type: 'string'
                   },
                   email: {
                     type: 'string'
                   },
                   isAdmin: {
                     type: 'boolean'
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
  */
  res.json({ 
    message: 'authenticated pong',
    user: req.user
  });
});


router.get('/admin', authenticateToken, isAdmin, (req, res) => {
  /* #swagger.tags = ['Health Check']
     #swagger.summary = 'Admin access check'
     #swagger.operationId = 'pingAdmin'
     #swagger.description = 'Verifies that the user has admin privileges'
     #swagger.security = [{
       "bearerAuth": []
     }]
     #swagger.responses[200] = {
       description: 'User has admin access',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               message: {
                 type: 'string',
                 example: 'admin pong'
               },
               user: {
                 type: 'object',
                 properties: {
                   userId: {
                     type: 'string'
                   },
                   email: {
                     type: 'string'
                   },
                   isAdmin: {
                     type: 'boolean'
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
       description: 'Forbidden - User is not an admin'
     }
  */
  res.json({ 
    message: 'admin pong',
    user: req.user
  });
});

export default router; 