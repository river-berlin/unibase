import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { TestDb } from '../../../database/testDb';
import { Express } from 'express';
import request from 'supertest';
import { setupTestApp, cleanupTestDb } from '../../__tests__/common';

describe('Register Route', () => {
  let db: TestDb;
  let app: Express;

  beforeEach(async () => {
    const setup = await setupTestApp();
    db = setup.db;
    app = setup.app;
  });

  afterEach(async () => {
    await cleanupTestDb(db);
  });

  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'User registered successfully',
        userId: expect.any(String)
      })
    );

    // Verify user was created
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'name'])
      .where('email', '=', 'test@example.com')
      .executeTakeFirst();

    expect(user).toEqual({
      id: expect.any(String),
      email: 'test@example.com',
      name: 'Test User'
    });

    // Verify default organization was created
    const org = await db
      .selectFrom('organizations')
      .selectAll()
      .where('name', '=', 'Test User\'s Workspace')
      .executeTakeFirst();

    expect(org).toBeTruthy();
    expect(org).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Test User\'s Workspace',
        is_default: 1,
        created_at: expect.any(String),
        updated_at: expect.any(String)
      })
    );

    // Verify user was added as owner of organization
    const membership = await db
      .selectFrom('organization_members')
      .selectAll()
      .where('user_id', '=', user!.id)
      .where('organization_id', '=', org!.id)
      .executeTakeFirst();

    expect(membership).toBeTruthy();
    expect(membership).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        organization_id: org!.id,
        user_id: user!.id,
        role: 'owner',
        created_at: expect.any(String)
      })
    );
  });

  it('should return 409 if email already exists', async () => {
    const existingUser = {
      id: uuidv4(),
      email: 'existing@example.com',
      name: 'Existing User',
      password_hash: 'dummy-hash',
      salt: 'salt',
      is_admin: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: new Date().toISOString()
    };

    await db
      .insertInto('users')
      .values(existingUser)
      .execute();

    const response = await request(app)
      .post('/auth/register')
      .send({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User'
      });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: 'Email already registered'
    });
  });

  it('should return 400 for invalid email', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
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

  it('should return 400 for short password', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        email: 'test2@example.com',
        password: 'short',
        name: 'Test User'
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