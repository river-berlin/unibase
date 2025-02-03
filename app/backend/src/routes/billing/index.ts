import express from 'express';
import checkoutRouter from './createCheckoutSession';
import portalRouter from './createPortalSession';

const router = express.Router();

router.use('/create-checkout-session', checkoutRouter);
router.use('/create-portal-session', portalRouter);

// you will notice webhook.ts is not present here
// it is directly put in app.ts
// this is because stripe webhook signature verification
// is not working otherwise
// see https://stackoverflow.com/questions/70159949/webhook-signature-verification-failed-with-express-stripe

export default router; 