import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { TestDb } from '../../../database/testDb';
import { Express } from 'express';
import request from 'supertest';
import { setupTestApp, cleanupTestDb } from '../../__tests__/common';
import jwt from 'jsonwebtoken';

describe('Ping Route', () => {
  let db: TestDb;
  let app: Express;
  let normalUser: { id: string; email: string; name: string; };
  let adminUser: { id: string; email: string; name: string; };
  let normalToken: string;
  let adminToken: string;

  beforeEach(async () => {
    const setup = await setupTestApp();
    db = setup.db;
    app = setup.app;

    // Create test users
    const now = new Date().toISOString();
    
    // Normal user
    normalUser = {
      id: uuidv4(),
      email: 'user@example.com',
      name: 'Normal User'
    };
    await db
      .insertInto('users')
      .values({
        ...normalUser,
        password_hash: 'hash',
        salt: 'salt',
        is_admin: 0,
        created_at: now,
        updated_at: now,
        last_login_at: now
      })
      .execute();

    // Admin user
    adminUser = {
      id: uuidv4(),
      email: 'admin@example.com',
      name: 'Admin User'
    };
    await db
      .insertInto('users')
      .values({
        ...adminUser,
        password_hash: 'hash',
        salt: 'salt',
        is_admin: 1,
        created_at: now,
        updated_at: now,
        last_login_at: now
      })
      .execute();

    // Create tokens
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    normalToken = jwt.sign(
      { 
        userId: normalUser.id,
        email: normalUser.email,
        name: normalUser.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { 
        userId: adminUser.id,
        email: adminUser.email,
        name: adminUser.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    await cleanupTestDb(db);
  });

  it('should return pong', async () => {
    const response = await request(app).get('/ping');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'pong'
    });
  });

  describe('/ping/auth', () => {
    it('should return authenticated pong with valid token', async () => {
      const response = await request(app)
        .get('/ping/auth')
        .set('Authorization', `Bearer ${normalToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'authenticated pong',
        user: {
          userId: normalUser.id,
          email: normalUser.email,
          name: normalUser.name
        }
      });
      // Verify JWT fields exist
      expect(response.body.user).toHaveProperty('iat');
      expect(response.body.user).toHaveProperty('exp');
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/ping/auth');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'No token provided'
      });
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/ping/auth')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Invalid token'
      });
    });
  });

  describe('/ping/admin', () => {
    it('should return admin pong with admin token', async () => {
      const response = await request(app)
        .get('/ping/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'admin pong',
        user: {
          userId: adminUser.id,
          email: adminUser.email,
          name: adminUser.name
        }
      });
      // Verify JWT fields exist
      expect(response.body.user).toHaveProperty('iat');
      expect(response.body.user).toHaveProperty('exp');
    });

    it('should return 403 with non-admin token', async () => {
      const response = await request(app)
        .get('/ping/admin')
        .set('Authorization', `Bearer ${normalToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: 'Admin access required'
      });
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/ping/admin');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'No token provided'
      });
    });
  });
});

export = {}