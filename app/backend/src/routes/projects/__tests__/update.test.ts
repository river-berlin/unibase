import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { TestDb } from '../../../database/testDb';
import { Express } from 'express';
import request from 'supertest';
import { setupTestApp, cleanupTestDb } from '../../__tests__/common';
import jwt from 'jsonwebtoken';

describe('Update Project Route', () => {
  let db: TestDb;
  let app: Express;
  let testUser: { id: string; email: string; name: string; };
  let token: string;
  let organizationId: string;
  let folderId: string;
  let projectId: string;

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

    // Create test folder directly in database
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

    // Create test project directly in database
    projectId = uuidv4();
    await db
      .insertInto('projects')
      .values({
        id: projectId,
        name: 'Test Project',
        description: 'Test Description',
        organization_id: organizationId,
        folder_id: folderId,
        icon: 'default',
        created_by: testUser.id,
        last_modified_by: testUser.id,
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

  it('should update a project successfully', async () => {
    const updateData = {
      name: 'Updated Project',
      description: 'Updated Description',
      icon: 'new-icon'
    };

    const response = await request(app)
      .put(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: projectId,
      name: 'Updated Project',
      description: 'Updated Description',
      icon: 'new-icon',
      folder_id: folderId,
      folder_name: 'Test Folder',
      folder_path: '/Test Folder'
    });

    // Verify last_modified_by was updated
    expect(response.body.last_modified_by).toBe(testUser.id);
    expect(new Date(response.body.updated_at)).toBeInstanceOf(Date);
  });

  it('should update project folder successfully', async () => {
    // Create another folder
    const newFolderId = uuidv4();
    const now = new Date().toISOString();
    
    await db
      .insertInto('folders')
      .values({
        id: newFolderId,
        name: 'New Folder',
        organization_id: organizationId,
        parent_folder_id: null,
        path: '/New Folder',
        created_at: now,
        updated_at: now
      })
      .execute();

    const response = await request(app)
      .put(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        folder_id: newFolderId
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: projectId,
      folder_id: newFolderId,
      folder_name: 'New Folder',
      folder_path: '/New Folder'
    });
  });

  it('should return 400 for empty name', async () => {
    const response = await request(app)
      .put(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: ''
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Name cannot be empty'
        })
      ])
    );
  });

  it('should return 400 for non-existent folder', async () => {
    const nonExistentFolderId = uuidv4();
    const response = await request(app)
      .put(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        folder_id: nonExistentFolderId
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Folder not found'
    });
  });

  it('should return 403 for folder from different organization', async () => {
    // Create folder in different organization
    const otherOrgId = uuidv4();
    const otherFolderId = uuidv4();
    const now = new Date().toISOString();
    
    await db
      .insertInto('organizations')
      .values({
        id: otherOrgId,
        name: 'Other Org',
        created_at: now,
        updated_at: now,
        is_default: 0
      })
      .execute();

    await db
      .insertInto('folders')
      .values({
        id: otherFolderId,
        name: 'Other Folder',
        organization_id: otherOrgId,
        parent_folder_id: null,
        path: '/Other Folder',
        created_at: now,
        updated_at: now
      })
      .execute();

    const response = await request(app)
      .put(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        folder_id: otherFolderId
      });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: 'Folder belongs to a different organization'
    });
  });

  it('should return 404 for non-existent project', async () => {
    const nonExistentId = uuidv4();
    const response = await request(app)
      .put(`/projects/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Project'
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Project not found'
    });
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .put(`/projects/${projectId}`)
      .send({
        name: 'Updated Project'
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
      .put(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${unauthorizedToken}`)
      .send({
        name: 'Updated Project'
      });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: 'No access to this organization'
    });
  });
}); 