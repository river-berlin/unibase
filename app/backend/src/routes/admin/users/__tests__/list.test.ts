import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TestDb, createTestDb, cleanupTestDb } from '../../../../database/testDb';
import { Express } from 'express';
import request from 'supertest';
import { createTestUser, createTestOrganization, addUserToOrganization, createAuthToken, TestUser } from './common';
import { setupTestApp } from '../../../__tests__/common';

describe('List Users Route', () => {
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

  it('should list users with pagination and search', async () => {
    // Create multiple test users
    const users = await Promise.all([
      createTestUser(db),
      createTestUser(db),
      createTestUser(db)
    ]);

    // Add users to organization
    await Promise.all(users.map(user => 
      addUserToOrganization(db, user.id, org.id)
    ));

    const response = await request(app)
      .get('/admin/users')
      .query({
        page: 1,
        limit: 2,
        search: users[0].email
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      users: expect.arrayContaining([
        expect.objectContaining({
          id: users[0].id,
          email: users[0].email,
          organizations: expect.arrayContaining([
            expect.objectContaining({
              id: org.id,
              name: org.name
            })
          ])
        })
      ]),
      total: 1,
      page: 1,
      totalPages: 1
    });
  });

  it('should return all users when no search is provided', async () => {
    // Create multiple test users
    const users = await Promise.all([
      createTestUser(db),
      createTestUser(db),
      createTestUser(db)
    ]);

    const response = await request(app)
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(4); // 3 test users + 1 admin
    expect(response.body.total).toBe(4);
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .get('/admin/users');

    expect(response.status).toBe(401);
  });

  it('should return 403 for non-admin user', async () => {
    const regularUser = await createTestUser(db, false);
    const regularToken = createAuthToken(regularUser);

    const response = await request(app)
      .get('/admin/users')
      .set('Authorization', `Bearer ${regularToken}`);

    expect(response.status).toBe(403);
  });

  it('should validate pagination parameters', async () => {
    const response = await request(app)
      .get('/admin/users')
      .query({
        page: 0,
        limit: 101
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'page',
          msg: 'Invalid value'
        }),
        expect.objectContaining({
          path: 'limit',
          msg: 'Invalid value'
        })
      ])
    );
  });
}); 