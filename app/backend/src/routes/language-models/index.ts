import { Router } from 'express';
import geminiRouter from './gemini';

const router = Router();

router.use('/gemini', geminiRouter);

export default router; 