import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { TestDb, createTestDb, cleanupTestDb } from '../../../database/testDb';
import { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { setupTestApp } from '../../__tests__/common';

describe('Get Folder Hierarchy Route', () => {
  let db: TestDb;
  let app: Express;
  let testUser: { id: string; email: string; name: string };
  let testOrg: { id: string };
  let rootFolder: { id: string };
  let subFolder: { id: string };
  let subSubFolder: { id: string };
  let token: string;

  beforeEach(async () => {
    // Create test database
    const setup = await setupTestApp();
    app = setup.app;
    db = setup.db;

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

    // Create root folder
    const rootFolderId = uuidv4();
    rootFolder = { id: rootFolderId };

    await db
      .insertInto('folders')
      .values({
        id: rootFolder.id,
        name: 'Root Folder',
        organization_id: testOrg.id,
        path: '/Root Folder',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Create subfolder
    const subFolderId = uuidv4();
    subFolder = { id: subFolderId };

    await db
      .insertInto('folders')
      .values({
        id: subFolder.id,
        name: 'Sub Folder',
        organization_id: testOrg.id,
        parent_folder_id: rootFolder.id,
        path: '/Root Folder/Sub Folder',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .execute();

    // Create sub-subfolder
    const subSubFolderId = uuidv4();
    subSubFolder = { id: subSubFolderId };

    await db
      .insertInto('folders')
      .values({
        id: subSubFolder.id,
        name: 'Sub Sub Folder',
        organization_id: testOrg.id,
        parent_folder_id: subFolder.id,
        path: '/Root Folder/Sub Folder/Sub Sub Folder',
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

  it('should get folder hierarchy successfully', async () => {
    const response = await request(app)
      .get(`/folders/${subSubFolder.id}/hierarchy`)
      .query({ organizationId: testOrg.id })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(3);
    
    // Check hierarchy order and content
    expect(response.body[0]).toMatchObject({
      id: rootFolder.id,
      name: 'Root Folder',
    });
    expect(response.body[1]).toMatchObject({
      id: subFolder.id,
      name: 'Sub Folder',
      parent_folder_id: rootFolder.id,
    });
    expect(response.body[2]).toMatchObject({
      id: subSubFolder.id,
      name: 'Sub Sub Folder',
      parent_folder_id: subFolder.id,
    });
  });

  it('should get single folder for root folder', async () => {
    const response = await request(app)
      .get(`/folders/${rootFolder.id}/hierarchy`)
      .query({ organizationId: testOrg.id })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      id: rootFolder.id,
      name: 'Root Folder',
      parent_folder_id: null,
    });
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
      .get(`/folders/${subSubFolder.id}/hierarchy`)
      .query({ organizationId: newOrgId })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .get(`/folders/${subSubFolder.id}/hierarchy`)
      .query({ organizationId: testOrg.id });

    expect(response.status).toBe(401);
  });
}); 