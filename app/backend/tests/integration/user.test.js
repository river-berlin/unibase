import request from 'supertest';
import { app } from '../../src/app.js';

describe('User API', () => {
  beforeEach(() => {
    // Clear users before each test
    global.users = new Map();
  });

  describe('POST /api/users/register', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body).toHaveProperty('token');
    });

    it('should not create a user with existing email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Create first user
      await request(app)
        .post('/api/users/register')
        .send(userData);

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User already exists');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login existing user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Register user first
      await request(app)
        .post('/api/users/register')
        .send(userData);

      // Try to login
      const response = await request(app)
        .post('/api/users/login')
        .send(userData);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body).toHaveProperty('token');
    });

    it('should not login with wrong password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Register user first
      await request(app)
        .post('/api/users/register')
        .send(userData);

      // Try to login with wrong password
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
}); 