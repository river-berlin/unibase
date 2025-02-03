import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { TestDb } from '../../../database/testDb';
import { Express } from 'express';
import request from 'supertest';
import { setupTestApp, cleanupTestDb } from '../../__tests__/common';
import jwt from 'jsonwebtoken';

describe('Create Folder Route', () => {
  let db: TestDb;
  let app: Express;
  let testUser: { id: string; email: string; name: string; };
  let token: string;
  let organizationId: string;
  let parentFolderId: string;

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
        role: 'owner',
        created_at: now
      })
      .execute();

    // Create parent folder directly in database
    parentFolderId = uuidv4();
    await db
      .insertInto('folders')
      .values({
        id: parentFolderId,
        name: 'Parent Folder',
        organization_id: organizationId,
        parent_folder_id: null,
        path: 'Parent Folder',
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

  it('should create a folder successfully', async () => {
    const response = await request(app)
      .post('/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Folder',
        organizationId: organizationId
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: 'Test Folder',
      path: 'Test Folder',
      parent_folder_id: null
    });

    // Verify timestamps are valid dates
    expect(new Date(response.body.created_at)).toBeInstanceOf(Date);
    expect(new Date(response.body.updated_at)).toBeInstanceOf(Date);
  });

  it('should create a subfolder successfully', async () => {
    const response = await request(app)
      .post('/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Subfolder',
        organizationId: organizationId,
        parentFolderId: parentFolderId
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: 'Test Subfolder',
      path: `${parentFolderId}/Test Subfolder`,
      parent_folder_id: parentFolderId
    });
  });

  it('should return 400 for missing required fields', async () => {
    const response = await request(app)
      .post('/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({
        path: 'name',
        msg: 'Invalid value',
        location: 'body'
      }),
      expect.objectContaining({
        path: 'organizationId',
        msg: 'Invalid value',
        location: 'body'
      })
    ]));
  });

  it('should return 404 for non-existent parent folder', async () => {
    const nonExistentId = uuidv4();
    const response = await request(app)
      .post('/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Folder',
        organizationId: organizationId,
        parentFolderId: nonExistentId
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Parent folder not found'
    });
  });

  it('should prevent creating folders beyond maximum nesting depth', async () => {
    // Create a hierarchy of folders up to the maximum depth
    const now = new Date().toISOString();
    const level1Id = uuidv4();
    const level2Id = uuidv4();
    const level3Id = uuidv4();
    const level4Id = uuidv4();

    // Level 1
    await db
      .insertInto('folders')
      .values({
        id: level1Id,
        name: 'Level 1',
        organization_id: organizationId,
        parent_folder_id: null,
        path: 'Level 1',
        created_at: now,
        updated_at: now
      })
      .execute();

    // Level 2
    await db
      .insertInto('folders')
      .values({
        id: level2Id,
        name: 'Level 2',
        organization_id: organizationId,
        parent_folder_id: level1Id,
        path: 'Level 1/Level 2',
        created_at: now,
        updated_at: now
      })
      .execute();

    // Level 3
    await db
      .insertInto('folders')
      .values({
        id: level3Id,
        name: 'Level 3',
        organization_id: organizationId,
        parent_folder_id: level2Id,
        path: 'Level 1/Level 2/Level 3',
        created_at: now,
        updated_at: now
      })
      .execute();

    // Level 4
    await db
      .insertInto('folders')
      .values({
        id: level4Id,
        name: 'Level 4',
        organization_id: organizationId,
        parent_folder_id: level3Id,
        path: 'Level 1/Level 2/Level 3/Level 4',
        created_at: now,
        updated_at: now
      })
      .execute();

    // Try to create a level 5 folder
    const response = await request(app)
      .post('/folders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Level 5',
        organizationId: organizationId,
        parentFolderId: level4Id
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Maximum folder nesting depth (4) exceeded'
    });
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .post('/folders')
      .send({
        name: 'Test Folder',
        organizationId: organizationId
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'No token provided'
    });
  });

  it('should return 403 for unauthorized organization', async () => {
    // Create another user without access to the organization
    const anotherUser = {
      id: uuidv4(),
      email: 'another@example.com',
      name: 'Another User'
    };

    const now = new Date().toISOString();
    await db
      .insertInto('users')
      .values({
        ...anotherUser,
        password_hash: 'hash',
        salt: 'salt',
        is_admin: 0,
        created_at: now,
        updated_at: now,
        last_login_at: now
      })
      .execute();

    const unauthorizedToken = jwt.sign(
      { 
        userId: anotherUser.id,
        email: anotherUser.email,
        name: anotherUser.name
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const response = await request(app)
      .post('/folders')
      .set('Authorization', `Bearer ${unauthorizedToken}`)
      .send({
        name: 'Test Folder',
        organizationId: organizationId
      });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: 'No access to this organization'
    });
  });
}); 