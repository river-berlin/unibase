import { Router, Request, Response, RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../../database/types';
import { Transaction } from 'kysely';

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
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password, name } = req.body;
      const db = req.app.locals.db;

      const existingUser = await db
        .selectFrom('users')
        .select('id')
        .where('email', '=', email)
        .executeTakeFirst();

      if (existingUser) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const now = new Date().toISOString();
      const userId = uuidv4();

      await db
        .insertInto('users')
        .values({
          id: userId,
          email,
          name,
          password_hash: passwordHash,
          salt,
          is_admin: 0,
          last_login_at: now,
          created_at: now,
          updated_at: now
        })
        .execute();

      const orgId = uuidv4();
      
      await db.transaction().execute(async (trx: Transaction<Database>) => {
        await trx
          .insertInto('organizations')
          .values({
            id: orgId,
            name: `${name}'s Workspace`,
            created_at: now,
            updated_at: now,
            is_default: 1
          })
          .execute();

        await trx
          .insertInto('organization_members')
          .values({
            id: uuidv4(),
            organization_id: orgId,
            user_id: userId,
            role: 'owner',
            created_at: now
          })
          .execute();
      });

      res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
      res.status(500).json({ error: 'Error registering user' });
    }
  }
);

export default router; 