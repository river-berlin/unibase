import { Router, Request, Response, RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import Users from '../../database/models/users';
import Organizations from '../../database/models/organizations';
import OrganizationMembers from '../../database/models/organization-members';
import { DB } from '../../database/db';

interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
    name: string;
  };
}

const router = Router();
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().notEmpty()
  ],
  async (req: RegisterRequest, res: Response): Promise<void> => {
    /* #swagger.tags = ['Users']
       #swagger.summary = 'Register new user'
       #swagger.operationId = 'createUserAccountAndWorkspace'
       #swagger.description = 'Creates a new user account with secure password hashing and initializes their default organization workspace'
       #swagger.requestBody = {
         required: true,
         content: {
           'application/json': {
             schema: {
               type: 'object',
               required: ['email', 'password', 'name'],
               properties: {
                 email: {
                   type: 'string',
                   format: 'email',
                   example: 'newuser@example.com'
                 },
                 password: {
                   type: 'string',
                   format: 'password',
                   minLength: 8,
                   description: 'Must be at least 8 characters long',
                   example: 'securepassword123'
                 },
                 name: {
                   type: 'string',
                   minLength: 1,
                   description: 'User\'s full name',
                   example: 'John Doe'
                 }
               }
             }
           }
         }
       }
       #swagger.responses[201] = {
         description: 'User registered successfully',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 message: {
                   type: 'string',
                   example: 'User registered successfully'
                 },
                 userId: {
                   type: 'string',
                   format: 'uuid',
                   description: 'The ID of the newly created user'
                 }
               }
             }
           }
         }
       }
       #swagger.responses[400] = {
         description: 'Validation error - Invalid email, password too short, or missing name',
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
                       msg: { 
                         type: 'string',
                         example: 'Password must be at least 8 characters long'
                       },
                       param: { 
                         type: 'string',
                         example: 'password'
                       },
                       location: { 
                         type: 'string',
                         example: 'body'
                       }
                     }
                   }
                 }
               }
             }
           }
         }
       }
       #swagger.responses[409] = {
         description: 'Email already registered',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 error: {
                   type: 'string',
                   example: 'Email already registered'
                 }
               }
             }
           }
         }
       }
       #swagger.responses[500] = {
         description: 'Server error during registration',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 error: {
                   type: 'string',
                   example: 'Error registering user'
                 }
               }
             }
           }
         }
       }
    */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password, name } = req.body;
    const db = req.app.locals.db;

    // Check if user already exists
    const existingUser = await Users.findByEmail(email, db);

    if (existingUser) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const now = new Date().toISOString();
    const userId = uuidv4();

    // Create user
    await Users.createUser({
      id: userId,
      email,
      name,
      password,
      is_admin: 0,
      last_login_at: now,
      created_at: now,
      updated_at: now
    }, db);

    const orgId = uuidv4();
    
    // Use transaction to create organization and add user as member
    await db.transaction(async (tx: DB) => {
      // Create organization
      await Organizations.createOrganization({
        id: orgId,
        name: `${name}'s Workspace`,
        created_at: now,
        updated_at: now,
        is_default: 1
      }, tx);

      // Add user as organization owner
      await OrganizationMembers.addMember({
        id: uuidv4(),
        organization_id: orgId,
        user_id: userId,
        role: 'owner',
        created_at: now
      }, tx);
    });

    res.status(201).json({ message: 'User registered successfully', userId });
  }
);

export default router; 