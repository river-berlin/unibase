import request from 'supertest';
import { app } from '../../../app.js';
import { setupTestUser, cleanupDatabase, setupTestDatabase } from '../../../../tests/setup.js';
import Stripe from 'stripe';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    subscriptions: {
      create: jest.fn().mockResolvedValue({
        id: 'sub_test123',
        client_secret: 'cs_test123'
      }),
      list: jest.fn().mockResolvedValue({
        data: []
      }),
      del: jest.fn().mockResolvedValue({
        id: 'sub_test123',
        status: 'canceled'
      })
    },
    customers: {
      create: jest.fn().mockResolvedValue({
        id: 'cus_test123'
      })
    }
  }));
});

describe('Billing API', () => {
  let testUser;
  let testToken;

  beforeAll(async () => {
    await setupTestDatabase();
    const setup = await setupTestUser();
    testUser = setup.user;
    testToken = setup.token;
  });

  beforeEach(async () => {
    await cleanupDatabase();
    await setupTestDatabase();
    const setup = await setupTestUser();
    testUser = setup.user;
    testToken = setup.token;
  });

  describe('POST /billing/subscribe', () => {
    it('should create a new subscription', async () => {
      const paymentMethodId = 'pm_card_visa';

      const response = await request(app)
        .post('/billing/subscribe')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ paymentMethodId });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('subscriptionId', 'sub_test123');
      expect(response.body).toHaveProperty('clientSecret', 'cs_test123');
    });

    it('should handle invalid payment method', async () => {
      const paymentMethodId = 'invalid_payment_method';

      const response = await request(app)
        .post('/billing/subscribe')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ paymentMethodId });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle missing payment method', async () => {
      const response = await request(app)
        .post('/billing/subscribe')
        .set('Authorization', `Bearer ${testToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /billing/status', () => {
    it('should return no subscription for new user', async () => {
      const response = await request(app)
        .get('/billing/status')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'no_subscription');
    });

    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/billing/status');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /billing/cancel', () => {
    it('should handle no subscription to cancel', async () => {
      const response = await request(app)
        .post('/billing/cancel')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'No subscription found');
    });

    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .post('/billing/cancel');

      expect(response.status).toBe(401);
    });
  });
}); 