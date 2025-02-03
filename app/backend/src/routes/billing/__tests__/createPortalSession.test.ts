import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { TestDb } from '../../../database/testDb';
import { Express } from 'express';
import request from 'supertest';
import { setupTestApp, cleanupTestDb } from '../../__tests__/common';
import jwt from 'jsonwebtoken';

describe('Create Portal Session Route', () => {
  let db: TestDb;
  let app: Express;
  let testUser: { id: string; email: string; name: string; };
  let token: string;

  beforeEach(async () => {
    const setup = await setupTestApp();
    db = setup.db;
    app = setup.app;

    // Create test user
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

    // Create JWT token
    token = jwt.sign(
      { 
        userId: testUser.id,
        email: testUser.email,
        name: testUser.name
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await cleanupTestDb(db);
  });

  it('should handle missing customer gracefully', async () => {
    const response = await request(app)
      .post('/billing/create-portal-session')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'No subscription found'
    });
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .post('/billing/create-portal-session');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'No token provided'
    });
  });
}); 