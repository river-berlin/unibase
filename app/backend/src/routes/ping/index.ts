import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

export default router; 