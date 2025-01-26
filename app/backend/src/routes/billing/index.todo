import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { authenticateToken } from '../../middleware/auth';

interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
}

interface AuthenticatedRequest extends Request {
  user?: User;
  body: {
    paymentMethodId?: string;
    priceId?: string;
  };
}

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Create a subscription
router.post('/subscribe', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentMethodId, priceId } = req.body;
    
    if (!paymentMethodId || !priceId) {
      return res.status(400).json({ error: 'Payment method ID and price ID are required' });
    }

    if (!req.user?.email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    // Create a customer
    const customer = await stripe.customers.create({
      payment_method: paymentMethodId,
      email: req.user.email
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    res.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get subscription status
router.get('/status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.email) {
      return res.status(400).json({ error: 'User email is required' });
    }
    
    // Get customer
    const customers = await stripe.customers.list({
      email: req.user.email,
      limit: 1
    });

    if (customers.data.length === 0) {
      return res.json({ status: 'no_subscription' });
    }

    const customer = customers.data[0];
    
    // Get subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 1,
      status: 'active'
    });

    if (subscriptions.data.length === 0) {
      return res.json({ status: 'no_subscription' });
    }

    const subscription = subscriptions.data[0];
    
    res.json({
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Cancel subscription
router.post('/cancel', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.email) {
      return res.status(400).json({ error: 'User email is required' });
    }
    
    // Get customer
    const customers = await stripe.customers.list({
      email: req.user.email,
      limit: 1
    });

    if (customers.data.length === 0) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const customer = customers.data[0];
    
    // Get subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    // Cancel at period end
    const subscription = await stripe.subscriptions.update(
      subscriptions.data[0].id,
      { cancel_at_period_end: true }
    );

    res.json({
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router; 