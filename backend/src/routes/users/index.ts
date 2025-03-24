import { Router } from 'express';
import loginRouter from './login';
import registerRouter from './register';
import getUserDetailsRouter from './getUserDetails';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

router.use(loginRouter);
router.use(registerRouter);

// Apply authentication and Swagger properties to all routes under /users/me
router.use('/me', 
  /* 
  #swagger.security = [{
    "bearerAuth": []
  }]
  
  #swagger.responses[401] = {
    description: 'Unauthorized - Missing or invalid token',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'User not authenticated'
            }
          }
        }
      }
    }
  }
  */
  authenticateToken,
  getUserDetailsRouter
);

export default router; 