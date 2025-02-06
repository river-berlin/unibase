import { Router } from 'express';
import llmRouter from './llm';
import historyRouter from './history';

const router = Router();

router.use('/llm', llmRouter);
router.use('/history', historyRouter);

export default router; 