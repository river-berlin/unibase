import request from 'supertest';
import { Database } from '../../../database/types';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Kysely } from 'kysely';
import { setupTestApp } from '../../__tests__/common';

describe('GET /users/me', () => {
  let app: Express.Application;
  let db: Kysely<Database>;
  let testUserId: string;
  let testOrgId: string;
  let validToken: string;

  beforeAll(async () => {
    const setup = await setupTestApp();
    db = setup.db;
    app = setup.app;

  });

  beforeEach(async () => {
    // Create test user
    testUserId = uuidv4();
    testOrgId = uuidv4();
    const now = new Date().toISOString();

    await db
      .insertInto('users')
      .values({
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
        password_hash: 'dummy_hash',
        salt: 'dummy_salt',
        is_admin: 0,
        created_at: now,
        updated_at: now,
        last_login_at: now
      })
      .execute();

    // Create test organization
    await db
      .insertInto('organizations')
      .values({
        id: testOrgId,
        name: 'Test Organization',
        created_at: now,
        updated_at: now,
        is_default: 1
      })
      .execute();

    // Add user to organization
    await db
      .insertInto('organization_members')
      .values({
        id: uuidv4(),
        organization_id: testOrgId,
        user_id: testUserId,
        role: 'owner',
        created_at: now
      })
      .execute();

    // Create valid JWT token
    validToken = jwt.sign(
      { userId: testUserId, email: 'test@example.com', name: 'Test User' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
  });

  afterEach(async () => {
    // Clean up test data
    await db.deleteFrom('organization_members').execute();
    await db.deleteFrom('organizations').execute();
    await db.deleteFrom('users').execute();
  });

  it('should return 401 if no token provided', async () => {
    const response = await request(app as any).get('/users/me');
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'No token provided');
  });

  it('should return 401 if invalid token provided', async () => {
    const response = await request(app as any)
      .get('/users/me')
      .set('Authorization', 'Bearer invalid_token');
    expect(response.status).toBe(401);
  });

  it('should return user details with organizations if valid token', async () => {
    const response = await request(app as any)
      .get('/users/me')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: testUserId,
      email: 'test@example.com',
      name: 'Test User',
      organizations: expect.arrayContaining([
        expect.objectContaining({
          id: testOrgId,
          name: 'Test Organization',
          role: 'owner'
        })
      ])
    });
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
    expect(response.body).toHaveProperty('last_login_at');
  });

  it('should return 404 if user not found in database', async () => {
    // Create token with non-existent user ID
    const nonExistentToken = jwt.sign(
      { userId: uuidv4(), email: 'nonexistent@example.com', name: 'Non Existent' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );

    const response = await request(app as any)
      .get('/users/me')
      .set('Authorization', `Bearer ${nonExistentToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'User not found');
  });

  it('should return empty organizations array if user has no organizations', async () => {
    // Remove user from organization
    await db
      .deleteFrom('organization_members')
      .where('user_id', '=', testUserId)
      .execute();

    const response = await request(app as any)
      .get('/users/me')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body.organizations).toHaveLength(0);
  });
}); 
