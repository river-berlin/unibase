import request from 'supertest';
import { createTestUser, deleteTestUser, setupTestApp } from '../../__tests__/common';
import jwt from 'jsonwebtoken';
import { TestDb } from '../../../database/testDb';
import { Express } from 'express';


describe('Billing Integration Tests', () => {
  let app: Express;
  let db: TestDb;
  let testUserId: string;
  let authToken: string;

  beforeAll(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    db = setup.db;

    const testUser = await createTestUser(db);
    testUserId = testUser.userId;

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set');
    }
    
    // Generate JWT token for authentication
    const token = jwt.sign(
      { userId: testUserId, email: `test${Date.now()}@example.com` },
      process.env.JWT_SECRET 
    );
    authToken = `Bearer ${token}`;
  });

  afterAll(async () => {
    await deleteTestUser(db, testUserId);
  });

  describe('Checkout Flow', () => {
    it('should create checkout session', async () => {
      const response = await request(app)
        .post('/billing/create-checkout-session')
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('url');
      expect(response.body.url).toContain('checkout.stripe.com');
    });
  });

  describe('Portal Flow', () => {
    it('should handle missing customer gracefully', async () => {
      const response = await request(app)
        .post('/billing/create-portal-session')
        .set('Authorization', authToken);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('No subscription found');
    });
  });
}); 