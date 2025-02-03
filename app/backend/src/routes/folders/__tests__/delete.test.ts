import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { TestDb } from '../../../database/testDb';
import { Express } from 'express';
import request from 'supertest';
import { setupTestApp, cleanupTestDb } from '../../__tests__/common';
import jwt from 'jsonwebtoken';

describe('Delete Folder Route', () => {
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

    // Add user to organization directly in database as owner
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

  it('should delete a folder successfully as owner', async () => {
    const response = await request(app)
      .delete(`/folders/${folderId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Folder deleted successfully'
    });

    // Verify folder was actually deleted
    const folder = await db
      .selectFrom('folders')
      .select('id')
      .where('id', '=', folderId)
      .executeTakeFirst();

    expect(folder).toBeUndefined();
  });

  it('should delete a folder successfully as admin', async () => {
    // Change user role to admin
    await db
      .updateTable('organization_members')
      .set({ role: 'admin' })
      .where('user_id', '=', testUser.id)
      .where('organization_id', '=', organizationId)
      .execute();

    const response = await request(app)
      .delete(`/folders/${folderId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Folder deleted successfully'
    });
  });

  it('should return 403 for regular member', async () => {
    // Change user role to member
    await db
      .updateTable('organization_members')
      .set({ role: 'member' })
      .where('user_id', '=', testUser.id)
      .where('organization_id', '=', organizationId)
      .execute();

    const response = await request(app)
      .delete(`/folders/${folderId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: 'No permission to delete this folder'
    });
  });

  it('should return 404 for non-existent folder', async () => {
    const nonExistentId = uuidv4();
    const response = await request(app)
      .delete(`/folders/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Folder not found'
    });
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .delete(`/folders/${folderId}`);

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
      .delete(`/folders/${folderId}`)
      .set('Authorization', `Bearer ${unauthorizedToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: 'No access to this folder'
    });
  });
}); 