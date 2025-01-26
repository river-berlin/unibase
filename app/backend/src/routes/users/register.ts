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

const registerHandler: RequestHandler = async (req: RegisterRequest, res: Response): Promise<void> => {
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
};

const router = Router();
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().notEmpty()
  ],
  registerHandler
);

export default router; 