import { Router } from 'express';
import geminiRouter from './gemini.js';

const router = Router();

router.use('/gemini', geminiRouter);

export default router; 