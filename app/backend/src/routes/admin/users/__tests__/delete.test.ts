import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TestDb, createTestDb, cleanupTestDb } from '../../../../database/testDb';
import { Express } from 'express';
import { createApp } from '../../../../app';
import request from 'supertest';
import { createTestUser, createTestOrganization, addUserToOrganization, createAuthToken, createTestProject, TestUser } from './common';

describe('Delete User Route', () => {
  let db: TestDb;
  let app: Express;
  let adminUser: TestUser;
  let adminToken: string;
  let org: { id: string; name: string };

  beforeEach(async () => {
    // Create test database and app
    db = await createTestDb();
    app = createApp(db);

    // Create admin user
    adminUser = await createTestUser(db, true);
    adminToken = createAuthToken(adminUser);

    // Create test organization
    org = await createTestOrganization(db);
    await addUserToOrganization(db, adminUser.id, org.id, 'owner');
  });

  afterEach(async () => {
    await cleanupTestDb(db);
  });

  it('should delete user and related data successfully', async () => {
    const user = await createTestUser(db, false);
    await addUserToOrganization(db, user.id, org.id);
    const projectId = await createTestProject(db, {
      organizationId: org.id,
      createdBy: user.id
    });

    const response = await request(app)
      .delete(`/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'User deleted successfully'
    });

    // Verify user was deleted
    const deletedUser = await db
      .selectFrom('users')
      .select(['id'])
      .where('id', '=', user.id)
      .executeTakeFirst();
    expect(deletedUser).toBeUndefined();

    // Verify organization membership was deleted
    const membership = await db
      .selectFrom('organization_members')
      .select(['id'])
      .where('user_id', '=', user.id)
      .executeTakeFirst();
    expect(membership).toBeUndefined();

    // Verify project was deleted
    const project = await db
      .selectFrom('projects')
      .select(['id'])
      .where('id', '=', projectId)
      .executeTakeFirst();
    expect(project).toBeUndefined();
  });

  it('should return 404 for non-existent user', async () => {
    const nonExistentId = 'non-existent-id';
    const response = await request(app)
      .delete(`/admin/users/${nonExistentId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'User not found'
    });
  });

  it('should return 401 without token', async () => {
    const user = await createTestUser(db, false);
    const response = await request(app)
      .delete(`/admin/users/${user.id}`);

    expect(response.status).toBe(401);
  });

  it('should return 403 for non-admin user', async () => {
    const regularUser = await createTestUser(db, false);
    const regularToken = createAuthToken(regularUser);
    const targetUser = await createTestUser(db, false);

    const response = await request(app)
      .delete(`/admin/users/${targetUser.id}`)
      .set('Authorization', `Bearer ${regularToken}`);

    expect(response.status).toBe(403);
  });

  it('should prevent deleting own account', async () => {
    const response = await request(app)
      .delete(`/admin/users/${adminUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Cannot delete your own account'
    });
  });
}); 