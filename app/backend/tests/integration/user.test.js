import request from 'supertest';
import { app, prisma } from '../../src/app.js';

describe('User Management API', () => {
  beforeEach(async () => {
    // Clean up the database before each test
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(userData.email);
      expect(response.body.name).toBe(userData.name);
      expect(response.body).not.toHaveProperty('password');

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(user).toBeTruthy();
      expect(user.email).toBe(userData.email);
    });

    it('should not create user with existing email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      await request(app).post('/api/users').send(userData);

      await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete an existing user', async () => {
      // Create a user first
      const userData = {
        email: 'delete@example.com',
        password: 'password123',
        name: 'Delete User',
      };

      const createResponse = await request(app)
        .post('/api/users')
        .send(userData);

      const userId = createResponse.body.id;

      // Delete the user
      await request(app)
        .delete(`/api/users/${userId}`)
        .expect(204);

      // Verify user was deleted
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      expect(user).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .delete('/api/users/non-existent-id')
        .expect(404);
    });
  });
}); 