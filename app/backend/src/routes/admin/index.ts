import { Router } from 'express';
import userRoutes from './users';

const router = Router();

// Attach all admin routes
router.use('/users', userRoutes);

export default router; 