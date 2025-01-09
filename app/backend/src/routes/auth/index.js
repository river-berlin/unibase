import { Router } from 'express';
import userRoutes from '../users/index.js';

const router = Router();

router.use(userRoutes);

export default router; 