import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/db.js';

const router = Router();

/**
 * Register a new user
 * 
 * @route POST /auth/register
 * @param {string} email - User's email address
 * @param {string} password - User's password (min 8 characters)
 * @param {string} name - User's full name
 * 
 * @returns {Object} 201 - User created successfully
 * @returns {Object} 400 - Validation error
 * @returns {Object} 409 - Email already exists
 * @returns {Object} 500 - Server error
 * 
 * @example
 * {
 *   "email": "user@example.com",
 *   "password": "securepassword123",
 *   "name": "John Doe"
 * }
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().notEmpty()
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      // Check if user already exists using Kysely's type-safe query builder
      const existingUser = await db
        .selectFrom('users')
        .select('id')
        .where('email', '=', email)
        .executeTakeFirst();

      if (existingUser) {
        return res.status(409).json({ 
          error: 'Email already registered' 
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user with a UUID
      const userId = uuidv4();
      const now = new Date().toISOString();

      await db
        .insertInto('users')
        .values({
          id: userId,
          email,
          name,
          password_hash: passwordHash,
          last_login_at: now,
          created_at: now,
          updated_at: now
        })
        .execute();

      // Create default organization for the user
      const orgId = uuidv4();
      
      await db.transaction().execute(async (trx) => {
        // Create organization
        await trx
          .insertInto('organizations')
          .values({
            id: orgId,
            name: `${name}'s Workspace`,
            is_default: 1,
            created_at: now,
            updated_at: now
          })
          .execute();

        // Add user as owner of organization
        await trx
          .insertInto('organization_members')
          .values({
            organization_id: orgId,
            user_id: userId,
            role: 'owner',
            join_date: now
          })
          .execute();
      });

      res.status(201).json({
        message: 'User registered successfully',
        userId
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        error: 'Error creating user account' 
      });
    }
  }
);

export default router; 