import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { TestDb, createTestDb, cleanupTestDb } from '../../../database/testDb';
import { Express } from 'express';
import { createApp } from '../../../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { sql } from 'kysely';

describe('Get Folder Contents Route', () => {
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

    // Create test projects in the folder
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

    // Create a subfolder
    await db
      .insertInto('folders')
      .values({
        id: uuidv4(),
        name: 'Subfolder',
        organization_id: testOrg.id,
        parent_folder_id: testFolder.id,
        path: '/Test Folder/Subfolder',
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

  it('should get folder contents successfully', async () => {
    const response = await request(app)
      .get(`/folders/${testFolder.id}/contents`)
      .query({ organizationId: testOrg.id })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('projects');
    expect(response.body).toHaveProperty('subfolders');
    expect(Array.isArray(response.body.projects)).toBe(true);
    expect(Array.isArray(response.body.subfolders)).toBe(true);
    expect(response.body.projects.length).toBe(1);
    expect(response.body.subfolders.length).toBe(1);
    
    // Check project details
    expect(response.body.projects[0]).toMatchObject({
      name: 'Project A',
      description: 'Test project A',
      created_by_name: 'Test User'
    });

    // Check subfolder details
    expect(response.body.subfolders[0]).toMatchObject({
      name: 'Subfolder',
      path: '/Test Folder/Subfolder'
    });
  });

  it('should return empty arrays for folder with no contents', async () => {
    // Create an empty folder
    const emptyFolderId = uuidv4();
    await db
      .insertInto('folders')
      .values({
        id: emptyFolderId,
        name: 'Empty Folder',
        organization_id: testOrg.id,
        path: '/Empty Folder',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    const response = await request(app)
      .get(`/folders/${emptyFolderId}/contents`)
      .query({ organizationId: testOrg.id })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.projects).toHaveLength(0);
    expect(response.body.subfolders).toHaveLength(0);
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
      .get(`/folders/${testFolder.id}/contents`)
      .query({ organizationId: newOrgId })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .get(`/folders/${testFolder.id}/contents`)
      .query({ organizationId: testOrg.id });

    expect(response.status).toBe(401);
  });
}); 