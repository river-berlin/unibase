import { describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createTestDb, TestDb } from '../../../database/testDb';
import createProjectRoute from '../create';

describe('Create Project Route', () => {
  let db: TestDb;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let userId: string;
  let orgId: string;

  beforeEach(async () => {
    // Setup in-memory database
    db = await createTestDb();
    
    // Create test user
    userId = uuidv4();
    await db
      .insertInto('users')
      .values({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        password_hash: 'dummy-hash',
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: null
      })
      .execute();

    // Create test organization and membership
    orgId = uuidv4();
    await db
      .insertInto('organization_members')
      .values({
        id: uuidv4(),
        organization_id: orgId,
        user_id: userId,
        role: 'member',
        created_at: new Date().toISOString()
      })
      .execute();

    // Setup request and response mocks
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockReq = {
      body: {
        name: 'Test Project',
        description: 'Test Description',
        organizationId: orgId,
        folderId: 'folder123'
      },
      user: {
        id: userId,
        email: 'test@example.com'
      }
    };
    mockRes = {
      json: mockJson,
      status: mockStatus
    };
  });

  afterEach(async () => {
    await db.destroy();
  });

  it('should create a project successfully', async () => {
    await createProjectRoute.handle(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test Project',
      description: 'Test Description',
      folder_id: 'folder123'
    }));

    // Verify project was created in database
    const project = await db
      .selectFrom('projects')
      .selectAll()
      .where('name', '=', 'Test Project')
      .executeTakeFirst();

    expect(project).toBeDefined();
    expect(project?.organization_id).toBe(orgId);
    expect(project?.created_by).toBe(userId);
  });

  it('should return 400 if name or organizationId is missing', async () => {
    mockReq.body = {};

    await createProjectRoute.handle(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Name and organizationId are required'
    });
  });

  it('should return 403 if user has no access to organization', async () => {
    mockReq.body.organizationId = uuidv4(); // Different org ID

    await createProjectRoute.handle(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'No access to this organization'
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = undefined;

    await createProjectRoute.handle(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'User not authenticated'
    });
  });
}); 