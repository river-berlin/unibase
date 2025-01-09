import { Router } from 'express';
import loginRouter from './login.js';
import registerRouter from './register.js';

const router = Router();

router.use(loginRouter);
router.use(registerRouter);

export default router; 