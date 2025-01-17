import { db } from '../src/database/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { sql } from 'kysely';

// Set required environment variables for tests
process.env.GEMINI_API_KEY = 'test-key';
process.env.JWT_SECRET = 'test-secret';
process.env.STRIPE_SECRET_KEY = 'test-stripe-key';
process.env.STRIPE_MONTHLY_PRICE_ID = 'test-price-id';

// Test user data
export const TEST_USER = {
  id: uuidv4(),
  email: 'test@example.com',
  password: 'testpassword123'
};

// Helper to create test user and get auth token
export async function setupTestUser() {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(TEST_USER.password, salt);
  
  // Create test user
  await db
    .insertInto('users')
    .values({
      id: TEST_USER.id,
      email: TEST_USER.email,
      password_hash: passwordHash,
      name: 'Test User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .execute();

  // Create test organization
  const orgId = uuidv4();
  await db
    .insertInto('organizations')
    .values({
      id: orgId,
      name: 'Test Organization',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .execute();

  // Add user to organization
  await db
    .insertInto('organization_members')
    .values({
      organization_id: orgId,
      user_id: TEST_USER.id,
      role: 'owner',
      join_date: new Date().toISOString()
    })
    .execute();

  // Create auth token
  const token = jwt.sign(
    { userId: TEST_USER.id },
    process.env.JWT_SECRET
  );

  return { user: TEST_USER, token, organizationId: orgId };
}

// Helper to clean up database
export async function cleanupDatabase() {
  try {
    await db
      .deleteFrom('organization_members')
      .execute();
    
    await db
      .deleteFrom('organizations')
      .execute();
    
    await db
      .deleteFrom('projects')
      .execute();
    
    await db
      .deleteFrom('users')
      .execute();
  } catch (error) {
    console.error('Error cleaning up database:', error);
    throw error;
  }
}

// Setup test database schema
async function createTestSchema() {
  // Create users table
  await db.schema
    .createTable('users')
    .ifNotExists()
    .addColumn('id', 'text', col => col.primaryKey().notNull())
    .addColumn('email', 'text', col => col.unique().notNull())
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('password_hash', 'text', col => col.notNull())
    .addColumn('salt', 'text')
    .addColumn('avatar_url', 'text')
    .addColumn('last_login_at', 'text')
    .addColumn('is_admin', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('created_at', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Create organizations table
  await db.schema
    .createTable('organizations')
    .ifNotExists()
    .addColumn('id', 'text', col => col.primaryKey().notNull())
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('description', 'text')
    .addColumn('is_default', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('created_at', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Create organization_members table
  await db.schema
    .createTable('organization_members')
    .ifNotExists()
    .addColumn('organization_id', 'text', col => 
      col.references('organizations.id').onDelete('cascade').notNull()
    )
    .addColumn('user_id', 'text', col => 
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('role', 'text', col => col.notNull().check(sql`role IN ('owner', 'admin', 'member')`))
    .addColumn('join_date', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addPrimaryKeyConstraint('organization_members_pkey', ['organization_id', 'user_id'])
    .execute();

  // Create projects table
  await db.schema
    .createTable('projects')
    .ifNotExists()
    .addColumn('id', 'text', col => col.primaryKey().notNull())
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('description', 'text')
    .addColumn('organization_id', 'text', col => 
      col.references('organizations.id').onDelete('cascade').notNull()
    )
    .addColumn('icon', 'text', col => col.notNull().defaultTo('default'))
    .addColumn('created_by', 'text', col => 
      col.references('users.id').onDelete('set null').notNull()
    )
    .addColumn('last_modified_by', 'text', col => 
      col.references('users.id').onDelete('set null').notNull()
    )
    .addColumn('created_at', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();
}

// Setup test database
export async function setupTestDatabase() {
  try {
    await createTestSchema();
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
} 