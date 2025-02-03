import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { TestDb } from '../../../database/testDb';
import { Express } from 'express';
import request from 'supertest';
import { setupTestApp, cleanupTestDb } from '../../__tests__/common';
import bcrypt from 'bcryptjs';

describe('Login Route', () => {
  let db: TestDb;
  let app: Express;
  const testPassword = 'password123';
  let testUser: {
    id: string;
    email: string;
    name: string;
    password_hash: string;
    salt: string;
    is_admin: number;
    created_at: string;
    updated_at: string;
    last_login_at: string;
  };

  beforeEach(async () => {
    const setup = await setupTestApp();
    db = setup.db;
    app = setup.app;

    // Create a test user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(testPassword, salt);
    const now = new Date().toISOString();

    testUser = {
      id: uuidv4(),
      email: 'test@example.com',
      name: 'Test User',
      password_hash: passwordHash,
      salt,
      is_admin: 0,
      created_at: now,
      updated_at: now,
      last_login_at: now
    };

    await db
      .insertInto('users')
      .values(testUser)
      .execute();

    // Create a test organization and membership
    const orgId = uuidv4();
    await db
      .insertInto('organizations')
      .values({
        id: orgId,
        name: 'Test Organization',
        created_at: now,
        updated_at: now,
        is_default: 1
      })
      .execute();

    await db
      .insertInto('organization_members')
      .values({
        id: uuidv4(),
        organization_id: orgId,
        user_id: testUser.id,
        role: 'admin',
        created_at: now
      })
      .execute();
  });

  afterEach(async () => {
    await cleanupTestDb(db);
  });

  it('should login successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/users/login')
      .send({
        email: testUser.email,
        password: testPassword
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      token: expect.any(String),
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        organizations: expect.arrayContaining([
          expect.objectContaining({
            name: 'Test Organization',
            role: 'admin'
          })
        ])
      }
    });

    // Verify last_login_at was updated
    const updatedUser = await db
      .selectFrom('users')
      .select('last_login_at')
      .where('id', '=', testUser.id)
      .executeTakeFirst();

    expect(updatedUser?.last_login_at).not.toBe(testUser.last_login_at);
  });

  it('should return 401 with incorrect password', async () => {
    const response = await request(app)
      .post('/users/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Invalid credentials'
    });
  });

  it('should return 401 with non-existent email', async () => {
    const response = await request(app)
      .post('/users/login')
      .send({
        email: 'nonexistent@example.com',
        password: testPassword
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Invalid credentials'
    });
  });

  it('should return 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/users/login')
      .send({
        email: 'invalid-email',
        password: testPassword
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({
          path: 'email'
        })
      ])
    });
  });

  it('should return 400 for empty password', async () => {
    const response = await request(app)
      .post('/users/login')
      .send({
        email: testUser.email,
        password: ''
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({
          path: 'password'
        })
      ])
    });
  });
}); 