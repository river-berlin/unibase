import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { TestDb } from '../../../database/testDb';
import { Express } from 'express';
import request from 'supertest';
import { setupTestApp, cleanupTestDb } from '../../__tests__/common';
import jwt from 'jsonwebtoken';

describe('Get All Projects Route', () => {
  let db: TestDb;
  let app: Express;
  let testUser: { id: string; email: string; name: string; };
  let token: string;
  let organizationId: string;
  let folderId: string;
  let projectIds: string[];

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

    // Create multiple test projects directly in database
    projectIds = [uuidv4(), uuidv4(), uuidv4()];
    await Promise.all(projectIds.map((id, index) => 
      db
        .insertInto('projects')
        .values({
          id,
          name: `Test Project ${index + 1}`,
          description: `Test Description ${index + 1}`,
          organization_id: organizationId,
          folder_id: index === 0 ? null : folderId, // First project without folder
          icon: 'default',
          created_by: testUser.id,
          last_modified_by: testUser.id,
          created_at: now,
          updated_at: now
        })
        .execute()
    ));

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

  it('should get all projects for an organization successfully', async () => {
    const response = await request(app)
      .get(`/projects/org/${organizationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: projectIds[0],
          name: 'Test Project 1',
          description: 'Test Description 1',
          folder_id: null,
          folder_name: null,
          folder_path: null
        }),
        expect.objectContaining({
          id: projectIds[1],
          name: 'Test Project 2',
          description: 'Test Description 2',
          folder_id: folderId,
          folder_name: 'Test Folder',
          folder_path: '/Test Folder'
        }),
        expect.objectContaining({
          id: projectIds[2],
          name: 'Test Project 3',
          description: 'Test Description 3',
          folder_id: folderId,
          folder_name: 'Test Folder',
          folder_path: '/Test Folder'
        })
      ])
    );
  });

  it('should return empty array for organization with no projects', async () => {
    // Create another organization
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

    // Add user to the new organization
    await db
      .insertInto('organization_members')
      .values({
        id: uuidv4(),
        organization_id: anotherOrgId,
        user_id: testUser.id,
        role: 'member',
        created_at: now
      })
      .execute();

    const response = await request(app)
      .get(`/projects/org/${anotherOrgId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .get(`/projects/org/${organizationId}`);

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
      .get(`/projects/org/${organizationId}`)
      .set('Authorization', `Bearer ${unauthorizedToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: 'No access to this organization'
    });
  });
}); 