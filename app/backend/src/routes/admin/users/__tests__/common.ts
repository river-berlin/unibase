import { TestDb } from '../../../../database/testDb';
import { Express } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { Database } from '../../../../database/types';

export interface TestUser {
  id: string;
  userId: string; // Required for auth middleware
  email: string;
  name: string;
  is_admin: boolean;
}

export interface TestOrganization {
  id: string;
  name: string;
}

export async function createTestUser(db: TestDb, isAdmin: boolean = false): Promise<TestUser> {
  const id = uuidv4();
  const user: TestUser = {
    id,
    userId: id, // Set both id and userId for auth middleware
    email: `test${uuidv4()}@example.com`,
    name: `Test User ${uuidv4()}`,
    is_admin: isAdmin
  };

  const now = new Date().toISOString();
  await db
    .insertInto('users')
    .values({
      id: user.id,
      email: user.email,
      name: user.name,
      is_admin: isAdmin ? 1 : 0,
      password_hash: 'hash',
      salt: 'salt',
      avatar: null,
      created_at: now,
      updated_at: now,
      last_login_at: now
    })
    .execute();

  return user;
}

export async function createTestOrganization(db: TestDb): Promise<TestOrganization> {
  const org: TestOrganization = {
    id: uuidv4(),
    name: `Test Organization ${uuidv4()}`
  };

  const now = new Date().toISOString();
  await db
    .insertInto('organizations')
    .values({
      id: org.id,
      name: org.name,
      description: null,
      is_default: 0,
      created_at: now,
      updated_at: now
    })
    .execute();

  return org;
}

export async function addUserToOrganization(
  db: TestDb,
  userId: string,
  orgId: string,
  role: 'owner' | 'admin' | 'member' = 'member'
): Promise<void> {
  await db
    .insertInto('organization_members')
    .values({
      id: uuidv4(),
      organization_id: orgId,
      user_id: userId,
      role,
      created_at: new Date().toISOString()
    })
    .execute();
}

export async function createTestProject(
  db: TestDb,
  {
    organizationId,
    createdBy,
    lastModifiedBy = createdBy,
    name = 'Test Project',
    description = 'Test project description'
  }: {
    organizationId: string;
    createdBy: string;
    lastModifiedBy?: string;
    name?: string;
    description?: string;
  }
): Promise<string> {
  const projectId = uuidv4();
  const now = new Date().toISOString();

  await db
    .insertInto('projects')
    .values({
      id: projectId,
      name,
      description,
      organization_id: organizationId,
      created_by: createdBy,
      last_modified_by: lastModifiedBy,
      created_at: now,
      updated_at: now,
      icon: '',
      folder_id: null
    })
    .execute();

  return projectId;
}

export function createAuthToken(user: TestUser): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
} 