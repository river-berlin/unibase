import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
}


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
 * @route POST /auth/login
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
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;
      const db = req.app.locals.db;

      // Find user by email using Kysely's type-safe query builder
      const user = await db
        .selectFrom('users')
        .select(['id', 'email', 'name', 'password_hash'])
        .where('email', '=', email)
        .executeTakeFirst();

      if (!user) {
        res.status(401).json({ 
          error: 'Invalid credentials' 
        });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        res.status(401).json({ 
          error: 'Invalid credentials' 
        });
        return;
      }

      // Update last login time
      await db
        .updateTable('users')
        .set({
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .where('id', '=', user.id)
        .execute();

      // Get user's organizations
      const organizations = await db
        .selectFrom('organization_members')
        .innerJoin('organizations', 'organizations.id', 'organization_members.organization_id')
        .select([
          'organizations.id',
          'organizations.name',
          'organization_members.role'
        ])
        .where('organization_members.user_id', '=', user.id)
        .execute();

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
        process.env.JWT_SECRET ,
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
      return;

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Error logging in' 
      });
      return;
    }
  }
);

export default router; 