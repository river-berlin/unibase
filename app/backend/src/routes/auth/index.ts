import { Router } from 'express';
import userRoutes from '../users';

const router = Router();

router.use(userRoutes);

export default router; 