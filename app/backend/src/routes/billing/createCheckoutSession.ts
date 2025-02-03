import express, { Response } from 'express';
import Stripe from 'stripe';
import { authenticateToken } from '../../middleware/auth';
import { AuthenticatedRequest } from '../../types';

const router = express.Router();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
});

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Billing']
   * #swagger.summary = 'Create Stripe Checkout session'
   * #swagger.description = 'Creates a new Stripe Checkout session for subscription'
   * #swagger.security = [{ "bearerAuth": [] }]
   * #swagger.operationId = 'createCheckoutSession'
   * #swagger.responses[200] = {
   *   description: 'Checkout session created',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           url: {
   *             type: 'string',
   *             description: 'Stripe Checkout URL'
   *           }
   *         }
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[401] = { description: 'Unauthorized' }
   * #swagger.responses[400] = { description: 'Bad request' }
   */
  try {
    if (!req.user?.email || !req.user?.userId) {
      res.status(400).json({ error: 'User email is required' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_MONTHLY_PRICE_ID,
        quantity: 1,
      }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard`,
      customer_email: req.user.email,
      metadata: {
        userId: req.user.userId
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router; 