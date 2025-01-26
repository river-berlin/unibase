import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { TestDb } from '../../../database/testDb';
import { Express } from 'express';
import request from 'supertest';
import { setupTestApp, cleanupTestDb } from '../../__tests__/common';
import jwt from 'jsonwebtoken';

describe('Create Project Route', () => {
  let db: TestDb;
  let app: Express;
  let user: { id: string; email: string; name: string; };
  let token: string;
  let organizationId: string;
  let folderId: string;

  beforeEach(async () => {
    const setup = await setupTestApp();
    db = setup.db;
    app = setup.app;

    // Create test user
    const now = new Date().toISOString();
    user = {
      id: uuidv4(),
      email: 'user@example.com',
      name: 'Test User'
    };

    await db
      .insertInto('users')
      .values({
        ...user,
        password_hash: 'hash',
        salt: 'salt',
        is_admin: 0,
        created_at: now,
        updated_at: now,
        last_login_at: now
      })
      .execute();

    // Create test organization
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

    // Add user to organization
    await db
      .insertInto('organization_members')
      .values({
        id: uuidv4(),
        organization_id: organizationId,
        user_id: user.id,
        role: 'admin',
        created_at: now
      })
      .execute();

    // Create test folder
    folderId = uuidv4();
    await db
      .insertInto('folders')
      .values({
        id: folderId,
        name: 'Test Folder',
        organization_id: organizationId,
        parent_folder_id: null,
        path: '/Test Folder',
        created_at: now,
        updated_at: now
      })
      .execute();

    // Create token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await cleanupTestDb(db);
  });

  it('should create a project successfully', async () => {
    const response = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Project',
        description: 'Test Description',
        organizationId,
        folderId
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: 'Test Project',
      description: 'Test Description',
      folder_id: folderId,
      icon: 'default'
    });
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');

    // Verify project was created in database
    const project = await db
      .selectFrom('projects')
      .selectAll()
      .where('id', '=', response.body.id)
      .executeTakeFirst();

    expect(project).toBeTruthy();
    expect(project?.organization_id).toBe(organizationId);
    expect(project?.created_by).toBe(user.id);
    expect(project?.last_modified_by).toBe(user.id);
  });

  it('should return 400 for missing required fields', async () => {
    const response = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'name'
        }),
        expect.objectContaining({
          path: 'organizationId'
        })
      ])
    );
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .post('/projects')
      .send({
        name: 'Test Project',
        organizationId
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'No token provided'
    });
  });

  it('should return 403 for unauthorized organization', async () => {
    const unauthorizedOrgId = uuidv4();
    const response = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Project',
        organizationId: unauthorizedOrgId
      });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: 'No access to this organization'
    });
  });

  it('should return 400 for non-existent folder', async () => {
    const nonExistentFolderId = uuidv4();
    const response = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Project',
        organizationId,
        folderId: nonExistentFolderId
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Folder not found'
    });
  });

  it('should return 403 for folder from different organization', async () => {
    // Create another organization and folder
    const anotherOrgId = uuidv4();
    const now = new Date().toISOString();
    
    await db
      .insertInto('organizations')
      .values({
        id: anotherOrgId,
        name: 'Another Org',
        created_at: now,
        updated_at: now,
        is_default: 0
      })
      .execute();

    const anotherFolderId = uuidv4();
    await db
      .insertInto('folders')
      .values({
        id: anotherFolderId,
        name: 'Another Folder',
        organization_id: anotherOrgId,
        parent_folder_id: null,
        path: '/Another Folder',
        created_at: now,
        updated_at: now
      })
      .execute();

    const response = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Project',
        organizationId,
        folderId: anotherFolderId
      });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: 'Folder does not belong to the specified organization'
    });
  });
}); 