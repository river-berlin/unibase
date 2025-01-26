import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { TestDb } from '../../../database/testDb';
import { Express } from 'express';
import request from 'supertest';
import { setupTestApp, cleanupTestDb } from '../../__tests__/common';
import jwt from 'jsonwebtoken';

describe('Get All Folders Route', () => {
  let db: TestDb;
  let app: Express;
  let testUser: { id: string; email: string; name: string; };
  let token: string;
  let organizationId: string;
  let folderId: string;

  beforeEach(async () => {
    const setup = await setupTestApp();
    db = setup.db;
    app = setup.app;

    // Create test user directly in database
    const now = new Date().toISOString();
    testUser = {
      id: uuidv4(),
      email: 'test@example.com',
      name: 'Test User'
    };

    await db
      .insertInto('users')
      .values({
        ...testUser,
        password_hash: 'hash',
        salt: 'salt',
        is_admin: 0,
        created_at: now,
        updated_at: now,
        last_login_at: now
      })
      .execute();

    // Create test organization directly in database
    organizationId = uuidv4();
    await db
      .insertInto('organizations')
      .values({
        id: organizationId,
        name: 'Test Organization',
        created_at: now,
        updated_at: now,
        is_default: 1
      })
      .execute();

    // Add user to organization directly in database
    await db
      .insertInto('organization_members')
      .values({
        id: uuidv4(),
        organization_id: organizationId,
        user_id: testUser.id,
        role: 'member',
        created_at: now
      })
      .execute();

    // Create test folder directly in database
    folderId = uuidv4();
    await db
      .insertInto('folders')
      .values({
        id: folderId,
        name: 'Test Folder',
        organization_id: organizationId,
        parent_folder_id: null,
        path: 'Test Folder',
        created_at: now,
        updated_at: now
      })
      .execute();

    // Create JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    token = jwt.sign(
      { 
        userId: testUser.id,
        email: testUser.email,
        name: testUser.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await cleanupTestDb(db);
  });

  it('should get all folders for an organization successfully', async () => {
    const response = await request(app)
      .get(`/folders/org/${organizationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      id: folderId,
      name: 'Test Folder',
      path: 'Test Folder',
      parent_folder_id: null
    });
    expect(response.body[0].created_at).toBeDefined();
    expect(response.body[0].updated_at).toBeDefined();
  });

  it('should return empty array for organization with no folders', async () => {
    // Create a new organization without folders
    const newOrgId = uuidv4();
    const now = new Date().toISOString();
    
    await db
      .insertInto('organizations')
      .values({
        id: newOrgId,
        name: 'Empty Org',
        created_at: now,
        updated_at: now,
        is_default: 0
      })
      .execute();

    await db
      .insertInto('organization_members')
      .values({
        id: uuidv4(),
        organization_id: newOrgId,
        user_id: testUser.id,
        role: 'member',
        created_at: now
      })
      .execute();

    const response = await request(app)
      .get(`/folders/org/${newOrgId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(0);
  });

  it('should return 403 for unauthorized organization', async () => {
    // Create another organization that the user doesn't have access to
    const unauthorizedOrgId = uuidv4();
    const now = new Date().toISOString();
    
    await db
      .insertInto('organizations')
      .values({
        id: unauthorizedOrgId,
        name: 'Unauthorized Org',
        created_at: now,
        updated_at: now,
        is_default: 0
      })
      .execute();

    const response = await request(app)
      .get(`/folders/org/${unauthorizedOrgId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: 'No access to this organization'
    });
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .get(`/folders/org/${organizationId}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'No token provided'
    });
  });
}); 