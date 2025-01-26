import { describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createTestDb, TestDb } from '../../../database/testDb';
import deleteProjectRoute from '../delete';

describe('Delete Project Route', () => {
  let db: TestDb;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let userId: string;
  let orgId: string;
  let projectId: string;

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
        role: 'member', // Default role, will be updated in specific tests
        created_at: new Date().toISOString()
      })
      .execute();

    // Create test project
    projectId = uuidv4();
    const now = new Date().toISOString();
    await db
      .insertInto('projects')
      .values({
        id: projectId,
        name: 'Test Project',
        description: 'Test Description',
        organization_id: orgId,
        icon: 'default',
        created_by: userId,
        last_modified_by: userId,
        created_at: now,
        updated_at: now
      })
      .execute();

    // Setup request and response mocks
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockReq = {
      params: {
        projectId
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

  it('should delete a project successfully when user is owner', async () => {
    // Update user role to owner
    await db
      .updateTable('organization_members')
      .set({ role: 'owner' })
      .where('user_id', '=', userId)
      .execute();

    await deleteProjectRoute.handle(mockReq as Request, mockRes as Response);

    expect(mockJson).toHaveBeenCalledWith({
      message: 'Project deleted successfully'
    });

    // Verify project was deleted
    const project = await db
      .selectFrom('projects')
      .selectAll()
      .where('id', '=', projectId)
      .executeTakeFirst();

    expect(project).toBeUndefined();
  });

  it('should delete a project successfully when user is admin', async () => {
    // Update user role to admin
    await db
      .updateTable('organization_members')
      .set({ role: 'admin' })
      .where('user_id', '=', userId)
      .execute();

    await deleteProjectRoute.handle(mockReq as Request, mockRes as Response);

    expect(mockJson).toHaveBeenCalledWith({
      message: 'Project deleted successfully'
    });

    const project = await db
      .selectFrom('projects')
      .selectAll()
      .where('id', '=', projectId)
      .executeTakeFirst();

    expect(project).toBeUndefined();
  });

  it('should delete a project successfully when user is creator', async () => {
    // Project is already created by the user in beforeEach

    await deleteProjectRoute.handle(mockReq as Request, mockRes as Response);

    expect(mockJson).toHaveBeenCalledWith({
      message: 'Project deleted successfully'
    });

    const project = await db
      .selectFrom('projects')
      .selectAll()
      .where('id', '=', projectId)
      .executeTakeFirst();

    expect(project).toBeUndefined();
  });

  it('should return 404 if project not found', async () => {
    mockReq.params.projectId = uuidv4(); // Non-existent project ID

    await deleteProjectRoute.handle(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Project not found'
    });
  });

  it('should return 403 if user has no access to project organization', async () => {
    // Create project in different organization
    const otherOrgId = uuidv4();
    const otherProjectId = uuidv4();
    const now = new Date().toISOString();
    
    await db
      .insertInto('projects')
      .values({
        id: otherProjectId,
        name: 'Other Project',
        description: 'Other Description',
        organization_id: otherOrgId,
        icon: 'default',
        created_by: userId,
        last_modified_by: userId,
        created_at: now,
        updated_at: now
      })
      .execute();

    mockReq.params.projectId = otherProjectId;

    await deleteProjectRoute.handle(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'No access to this project'
    });
  });

  it('should return 403 if user is not owner/admin and not creator', async () => {
    // Create project by different user
    const otherUserId = uuidv4();
    const now = new Date().toISOString();
    
    await db
      .updateTable('projects')
      .set({ created_by: otherUserId })
      .where('id', '=', projectId)
      .execute();

    await deleteProjectRoute.handle(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'No permission to delete this project'
    });
  });
}); 