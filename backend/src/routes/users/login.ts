import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Users from '../../database/models/users';
import OrganizationMembers from '../../database/models/organization-members';


interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

const router = Router();

/**
 * Login user
 * 
 * @route POST /users/login
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * 
 * @returns {Object} 200 - Login successful with JWT token
 * @returns {Object} 400 - Validation error
 * @returns {Object} 401 - Invalid credentials
 * @returns {Object} 500 - Server error
 * 
 * @example
 * {
 *   "email": "user@example.com",
 *   "password": "securepassword123"
 * }
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req: LoginRequest, res: Response): Promise<void> => {
    /* #swagger.tags = ['Users']
       #swagger.summary = 'User login'
       #swagger.operationId = 'authenticateUserAndGetSession'
       #swagger.description = 'Authenticates user credentials, updates last login time, and returns JWT token with user information including organizations'
       #swagger.requestBody = {
         required: true,
         content: {
           'application/json': {
             schema: {
               type: 'object',
               required: ['email', 'password'],
               properties: {
                 email: {
                   type: 'string',
                   format: 'email',
                   example: 'user@example.com'
                 },
                 password: {
                   type: 'string',
                   format: 'password',
                   example: 'securepassword123'
                 }
               }
             }
           }
         }
       }
       #swagger.responses[200] = {
         description: 'Login successful',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 token: {
                   type: 'string',
                   description: 'JWT token for authentication',
                   example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                 },
                 user: {
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
         }
       }
       #swagger.responses[400] = {
         description: 'Invalid email format',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 errors: {
                   type: 'array',
                   items: {
                     type: 'object',
                     properties: {
                       msg: { type: 'string' },
                       param: { type: 'string' },
                       location: { type: 'string' }
                     }
                   }
                 }
               }
             }
           }
         }
       }
       #swagger.responses[401] = {
         description: 'Invalid credentials',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 error: {
                   type: 'string',
                   example: 'Invalid credentials'
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
                   example: 'Error logging in'
                 }
               }
             }
           }
         }
       }
    */
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;
    const db = req.app.locals.db;

    // Find user by email
    const user = await Users.findByEmail(email, db);

    console.log('found user', user);

    if (!user || !user.id) {
      res.status(401).json({ 
        error: 'Invalid credentials' 
      });
      return;
    }

    if (!user.password_hash) {
      res.status(500).json({ 
        error: 'User account configuration error' 
      });
      return;
    }

    // Verify password
    const isValidPassword = await Users.authenticate(email, password, db);
    if (!isValidPassword) {
      res.status(401).json({ 
        error: 'Invalid credentials' 
      });
      return;
    }

    // Update last login time
    await Users.updateLastLogin(user.id, db);

    // Get user's organizations
    const organizations = await OrganizationMembers.findByUser(user.id, db);

    if (process.env.JWT_SECRET === undefined) {
      res.status(500).json({ 
        error: 'JWT_SECRET is not set' 
      });
      return;
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizations
      }
    });
  }
);

export default router; 