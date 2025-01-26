import { Router } from 'express';
import loginRouter from './login';
import registerRouter from './register';

const router = Router();

router.use(loginRouter);
router.use(registerRouter);

export default router; 