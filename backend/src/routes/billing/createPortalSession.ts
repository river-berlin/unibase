import express, { Response } from 'express';
import Stripe from 'stripe';
import { authenticateToken } from '../../middleware/auth';
import { AuthenticatedRequest } from '../../types';

const router = express.Router();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia'
});

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Billing']
   * #swagger.summary = 'Create Stripe Customer Portal session'
   * #swagger.description = 'Creates a new Stripe Customer Portal session for managing subscription'
   * #swagger.security = [{ "bearerAuth": [] }]
   * #swagger.operationId = 'createPortalSession'
   * #swagger.responses[200] = {
   *   description: 'Portal session created',
   *   content: {
   *     'application/json': {
   *       schema: {
   *         type: 'object',
   *         properties: {
   *           url: {
   *             type: 'string',
   *             description: 'Stripe Customer Portal URL'
   *           }
   *         }
   *       }
   *     }
   *   }
   * }
   * #swagger.responses[401] = { description: 'Unauthorized' }
   * #swagger.responses[404] = { description: 'No subscription found' }
   */
  try {
    if (!req.user?.userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Search for customer by metadata
    const customers = await stripe.customers.search({
      query: `metadata['userId']:'${req.user.userId}'`,
    });

    if (!customers.data.length) {
      res.status(404).json({ error: 'No subscription found' });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router; 