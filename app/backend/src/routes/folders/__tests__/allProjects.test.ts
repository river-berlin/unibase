import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { TestDb, createTestDb, cleanupTestDb } from '../../../database/testDb';
import { Express } from 'express';
import { createApp } from '../../../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { sql } from 'kysely';

describe('Get All Projects Route', () => {
  let db: TestDb;
  let app: Express;
  let testUser: { id: string; email: string; name: string };
  let testOrg: { id: string };
  let testFolder: { id: string };
  let token: string;

  beforeEach(async () => {
    // Create test database
    db = await createTestDb();
    app = createApp(db);

    // Create test user
    const userId = uuidv4();
    testUser = {
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
    };

    await db
      .insertInto('users')
      .values({
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        password_hash: 'hash',
        salt: 'salt',
        is_admin: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Create test organization
    const orgId = uuidv4();
    testOrg = { id: orgId };

    await db
      .insertInto('organizations')
      .values({
        id: testOrg.id,
        name: 'Test Organization',
        is_default: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Add user to organization
    await db
      .insertInto('organization_members')
      .values({
        id: uuidv4(),
        organization_id: testOrg.id,
        user_id: testUser.id,
        role: 'admin',
        created_at: new Date().toISOString(),
      })
      .execute();

    // Create test folder
    const folderId = uuidv4();
    testFolder = { id: folderId };

    await db
      .insertInto('folders')
      .values({
        id: testFolder.id,
        name: 'Test Folder',
        organization_id: testOrg.id,
        path: '/Test Folder',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Create test projects
    await db
      .insertInto('projects')
      .values({
        id: uuidv4(),
        name: 'Project A',
        description: 'Test project A',
        organization_id: testOrg.id,
        folder_id: testFolder.id,
        icon: sql`null`,
        created_by: testUser.id,
        last_modified_by: testUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    await db
      .insertInto('projects')
      .values({
        id: uuidv4(),
        name: 'Project B',
        description: 'Test project B',
        organization_id: testOrg.id,
        folder_id: testFolder.id,
        icon: sql`null`,
        created_by: testUser.id,
        last_modified_by: testUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Create JWT token
    token = jwt.sign(
      {
        userId: testUser.id,
        email: testUser.email,
        name: testUser.name,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await cleanupTestDb(db);
  });

  it('should get all projects for an organization successfully', async () => {
    const response = await request(app)
      .get(`/projects/org/${testOrg.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toMatchObject({
      name: 'Project A',
      description: 'Test project A',
      folder_name: 'Test Folder',
      folder_path: '/Test Folder',
    });
    expect(response.body[1]).toMatchObject({
      name: 'Project B',
      description: 'Test project B',
      folder_name: 'Test Folder',
      folder_path: '/Test Folder',
    });
  });

  it('should return an empty array for organization with no projects', async () => {
    // Create a new organization without any projects
    const newOrgId = uuidv4();
    await db
      .insertInto('organizations')
      .values({
        id: newOrgId,
        name: 'Empty Organization',
        is_default: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Add user to the new organization
    await db
      .insertInto('organization_members')
      .values({
        id: uuidv4(),
        organization_id: newOrgId,
        user_id: testUser.id,
        role: 'admin',
        created_at: new Date().toISOString(),
      })
      .execute();

    const response = await request(app)
      .get(`/projects/org/${newOrgId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it('should return 403 for unauthorized organization', async () => {
    // Create a new organization without adding the test user
    const newOrgId = uuidv4();
    await db
      .insertInto('organizations')
      .values({
        id: newOrgId,
        name: 'Unauthorized Organization',
        is_default: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    const response = await request(app)
      .get(`/projects/org/${newOrgId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('should return 401 without token', async () => {
    const response = await request(app).get(`/projects/org/${testOrg.id}`);

    expect(response.status).toBe(401);
  });
}); 