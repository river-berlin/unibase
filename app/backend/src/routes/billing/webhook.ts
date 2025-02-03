import express, { Request, Response } from 'express';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
});

const router = express.Router();

router.post('/webhook', express.raw({type: 'application/json'}), async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    res.status(400).send('No signature');
    return;
  }

  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET as string
  );

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.userId && session.customer) {
        await req.app.locals.db
          .updateTable('users')
          .set({ 
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString()
          })
          .where('id', '=', session.metadata.userId)
          .execute();
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      break;
  }

  res.json({received: true});
  return;
});

export default router; 