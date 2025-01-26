import { Router } from 'express';
import listRoute from './list';
import updateRoleRoute from './updateRole';
import deleteRoute from './delete';

const router = Router();

// Attach all user routes
router.use('/', listRoute);
router.use('/', updateRoleRoute);
router.use('/', deleteRoute);

export default router; 