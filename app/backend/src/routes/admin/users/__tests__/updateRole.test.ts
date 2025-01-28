import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TestDb, cleanupTestDb } from '../../../../database/testDb';
import { Express } from 'express';
import request from 'supertest';
import { createTestUser, createTestOrganization, addUserToOrganization, createAuthToken, TestUser } from './common';
import { setupTestApp } from '../../../__tests__/common';

describe('Update User Role Route', () => {
  let db: TestDb;
  let app: Express;
  let adminUser: TestUser;
  let adminToken: string;
  let org: { id: string; name: string };

  beforeEach(async () => {
    // Create test database and app
    const setup = await setupTestApp();
    app = setup.app;
    db = setup.db;

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

  it('should update user role successfully', async () => {
    const user = await createTestUser(db, false);
    await addUserToOrganization(db, user.id, org.id);

    const response = await request(app)
      .put(`/admin/users/${user.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        isAdmin: true
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'User role updated successfully'
    });

    // Verify the role was updated in the database
    const updatedUser = await db
      .selectFrom('users')
      .select(['is_admin'])
      .where('id', '=', user.id)
      .executeTakeFirst();

    expect(updatedUser?.is_admin).toBe(1);
  });

  it('should prevent updating own admin status', async () => {
    const response = await request(app)
      .put(`/admin/users/${adminUser.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        isAdmin: false
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Cannot modify your own admin status'
    });
  });

  it('should return 404 for non-existent user', async () => {
    const nonExistentId = 'non-existent-id';
    const response = await request(app)
      .put(`/admin/users/${nonExistentId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        isAdmin: true
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'User not found'
    });
  });

  it('should return 401 without token', async () => {
    const user = await createTestUser(db, false);
    const response = await request(app)
      .put(`/admin/users/${user.id}/role`)
      .send({
        isAdmin: true
      });

    expect(response.status).toBe(401);
  });

  it('should return 403 for non-admin user', async () => {
    const regularUser = await createTestUser(db, false);
    const regularToken = createAuthToken(regularUser);
    const targetUser = await createTestUser(db, false);

    const response = await request(app)
      .put(`/admin/users/${targetUser.id}/role`)
      .set('Authorization', `Bearer ${regularToken}`)
      .send({
        isAdmin: true
      });

    expect(response.status).toBe(403);
  });

  it('should validate isAdmin parameter', async () => {
    const user = await createTestUser(db, false);
    const response = await request(app)
      .put(`/admin/users/${user.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        isAdmin: 'not-a-boolean'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'isAdmin',
          msg: 'Invalid value'
        })
      ])
    );
  });
}); 