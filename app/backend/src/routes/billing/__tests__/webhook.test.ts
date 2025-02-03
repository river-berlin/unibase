import request from 'supertest';
import { createApp } from '../../../app';
import { db } from '../../../database/db';
import Stripe from 'stripe';
import { setupTestApp } from '../../__tests__/common';
import { TestDb } from '../../../database/testDb';
import { Express } from 'express';
if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('Missing required Stripe environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
});

describe('Webhook Integration', () => {
  let db: TestDb;
  let app: Express;

  beforeEach(async () => {
    const setup = await setupTestApp();
    db = setup.db;
    app = setup.app;
  });

  it('should handle webhook events from Stripe', async () => {
    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          customer: 'cus_test',
          metadata: { userId: 'test-user' }
        }
      }
    };

    const payloadString = JSON.stringify(mockEvent, null, 2);

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    const signature = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret: process.env.STRIPE_WEBHOOK_SECRET
    });

    const response = await request(app)
      .post('/billing/webhook')
      .set('stripe-signature', signature)
      .send(payloadString)
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });
  });
}); 