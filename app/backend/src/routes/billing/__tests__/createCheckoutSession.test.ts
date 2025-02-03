import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { TestDb } from '../../../database/testDb';
import { Express } from 'express';
import request from 'supertest';
import { setupTestApp, cleanupTestDb } from '../../__tests__/common';
import jwt from 'jsonwebtoken';

describe('Create Checkout Session Route', () => {
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
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set');
    }

    // Create JWT token
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

  it('should create a checkout session successfully', async () => {
    const response = await request(app)
      .post('/billing/create-checkout-session')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('url');
    expect(response.body.url).toContain('checkout.stripe.com');
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .post('/billing/create-checkout-session');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'No token provided'
    });
  });
}); 