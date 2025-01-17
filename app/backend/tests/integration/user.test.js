import request from 'supertest';
import { app } from '../../src/app.js';
import { cleanupDatabase } from '../setup.js';

describe('User API', () => {
  const userData = {
    email: 'newuser@example.com',
    password: 'password123',
    name: 'New User'
  };

  beforeEach(async () => {
    await cleanupDatabase();
  });

  describe('POST /auth/register', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('userId');
      expect(response.body.message).toBe('User registered successfully');
    });

    it('should not create a user with existing email', async () => {
      // First create a user
      await request(app)
        .post('/auth/register')
        .send(userData);

      // Try to create another user with same email
      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already registered');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a user before each login test
      await request(app)
        .post('/auth/register')
        .send(userData);
    });

    it('should login existing user', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body).toHaveProperty('token');
    });

    it('should not login with wrong password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
}); 