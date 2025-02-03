import { Router } from 'express';
import loginRouter from './login';
import registerRouter from './register';
import getUserDetailsRouter from './getUserDetails';

const router = Router();

router.use(loginRouter);
router.use(registerRouter);
router.use(getUserDetailsRouter);

export default router; 