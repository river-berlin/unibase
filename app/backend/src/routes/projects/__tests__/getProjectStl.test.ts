import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { TestDb } from '../../../database/testDb';
import { Express } from 'express';
import request from 'supertest';
import { setupTestApp, cleanupTestDb } from '../../__tests__/common';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';


describe('Get Project STL Route', () => {
  let db: TestDb;
  let app: Express;
  let userId: string;
  let projectId: string;
  let organizationId: string;
  let token: string;

  beforeEach(async () => {
    // Setup test app
    const setup = await setupTestApp();
    app = setup.app;
    db = setup.db;

    // Create test data
    userId = uuidv4();
    projectId = uuidv4();
    organizationId = uuidv4();
    const now = new Date().toISOString();

    // Create test user
    await db
      .insertInto('users')
      .values({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        password_hash: 'hash',
        salt: 'salt',
        is_admin: 0,
        created_at: now,
        updated_at: now,
        last_login_at: now
      })
      .execute();

    // Create test organization
    await db
      .insertInto('organizations')
      .values({
        id: organizationId,
        name: 'Test Org',
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
        user_id: userId,
        role: 'owner',
        created_at: now
      })
      .execute();

    // Create test project
    await db
      .insertInto('projects')
      .values({
        id: projectId,
        name: 'Test Project',
        organization_id: organizationId,
        created_by: userId,
        last_modified_by: userId,
        created_at: now,
        updated_at: now,
        icon: 'default'
      })
      .execute();

    // Create JWT token
    token = jwt.sign(
      { userId, email: 'test@example.com', name: 'Test User' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await cleanupTestDb(db);
    jest.clearAllMocks();
  });

  it('should return latest object converted to STL', async () => {
    const now = new Date().toISOString();
    const conversationId = uuidv4();
    const objectId = uuidv4();
    const scadContent = 'cube([10, 10, 10]);';
    const expectedStl = `solid OpenSCAD_Model
  facet normal -0 0 1
    outer loop
      vertex 0 10 10
      vertex 10 0 10
      vertex 10 10 10
    endloop
  endfacet
  facet normal 0 0 1
    outer loop
      vertex 10 0 10
      vertex 0 10 10
      vertex 0 0 10
    endloop
  endfacet
  facet normal 0 0 -1
    outer loop
      vertex 0 0 0
      vertex 10 10 0
      vertex 10 0 0
    endloop
  endfacet
  facet normal -0 0 -1
    outer loop
      vertex 10 10 0
      vertex 0 0 0
      vertex 0 10 0
    endloop
  endfacet
  facet normal 0 -1 0
    outer loop
      vertex 0 0 0
      vertex 10 0 10
      vertex 0 0 10
    endloop
  endfacet
  facet normal 0 -1 -0
    outer loop
      vertex 10 0 10
      vertex 0 0 0
      vertex 10 0 0
    endloop
  endfacet
  facet normal 1 -0 0
    outer loop
      vertex 10 0 10
      vertex 10 10 0
      vertex 10 10 10
    endloop
  endfacet
  facet normal 1 0 0
    outer loop
      vertex 10 10 0
      vertex 10 0 10
      vertex 10 0 0
    endloop
  endfacet
  facet normal 0 1 -0
    outer loop
      vertex 10 10 0
      vertex 0 10 10
      vertex 10 10 10
    endloop
  endfacet
  facet normal 0 1 0
    outer loop
      vertex 0 10 10
      vertex 10 10 0
      vertex 0 10 0
    endloop
  endfacet
  facet normal -1 0 0
    outer loop
      vertex 0 0 0
      vertex 0 10 10
      vertex 0 10 0
    endloop
  endfacet
  facet normal -1 -0 0
    outer loop
      vertex 0 10 10
      vertex 0 0 0
      vertex 0 0 10
    endloop
  endfacet
endsolid OpenSCAD_Model`;

    // Create conversation
    await db
      .insertInto('conversations')
      .values({
        id: conversationId,
        project_id: projectId,
        model: process.env.OPENAI_BASE_URL + '--' + process.env.OPENAI_MODEL,
        status: 'active',
        updated_at: now
      })
      .execute();

    // Create object
    await db
      .insertInto('objects')
      .values({
        id: objectId,
        object: scadContent,
        created_at: now,
        updated_at: now
      })
      .execute();

    // Create message with object
    await db
      .insertInto('messages')
      .values({
        id: uuidv4(),
        conversation_id: conversationId,
        role: 'assistant',
        content: 'Created a cube',
        object_id: objectId,
        created_by: userId,
        created_at: now,
        updated_at: now
      })
      .execute();

    const response = await request(app)
      .get(`/projects/${projectId}/stl`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.stl.trim()).toEqual(expectedStl.trim());
  });

  it('should return empty string when no objects exist', async () => {
    const response = await request(app)
      .get(`/projects/${projectId}/stl`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      stl: ''
    });
  });

  it('should return 404 for non-existent project', async () => {
    const nonExistentId = uuidv4();
    const response = await request(app)
      .get(`/projects/${nonExistentId}/stl`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Project not found'
    });
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .get(`/projects/${projectId}/stl`);

    expect(response.status).toBe(401);
  });

  it('should return 403 for unauthorized user', async () => {
    // Create another user not in the organization
    const otherUserId = uuidv4();
    const now = new Date().toISOString();

    await db
      .insertInto('users')
      .values({
        id: otherUserId,
        email: 'other@example.com',
        name: 'Other User',
        password_hash: 'hash',
        salt: 'salt',
        is_admin: 0,
        created_at: now,
        updated_at: now,
        last_login_at: now
      })
      .execute();

    const otherToken = jwt.sign(
      { userId: otherUserId, email: 'other@example.com', name: 'Other User' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    const response = await request(app)
      .get(`/projects/${projectId}/stl`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: 'No access to this project'
    });
  });

  it('should handle OpenSCAD conversion errors', async () => {
    const now = new Date().toISOString();
    const conversationId = uuidv4();
    const objectId = uuidv4();
    const invalidScad = 'invalid_scad_content';

    // Create conversation and object with invalid SCAD
    await db
      .insertInto('conversations')
      .values({
        id: conversationId,
        project_id: projectId,
        model: process.env.OPENAI_BASE_URL + '--' + process.env.OPENAI_MODEL,
        status: 'active',
        updated_at: now
      })
      .execute();

    await db
      .insertInto('objects')
      .values({
        id: objectId,
        object: invalidScad,
        created_at: now,
        updated_at: now
      })
      .execute();

    await db
      .insertInto('messages')
      .values({
        id: uuidv4(),
        conversation_id: conversationId,
        role: 'assistant',
        content: 'Created invalid SCAD',
        object_id: objectId,
        created_by: userId,
        created_at: now,
        updated_at: now
      })
      .execute();

    const response = await request(app)
      .get(`/projects/${projectId}/stl`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Error converting SCAD to STL'
    });
  });
}); 