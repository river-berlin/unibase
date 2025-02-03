import { Router } from 'express';
import create from './create';
import getProjectsRoute from './getAll';
import getSingleProject from './get';
import updateProjectRoute from './update';
import deleteProjectRoute from './delete';
import getProjectScadRoute from './getProjectScad';
import getProjectStlRoute from './getProjectStl';

const router = Router();

router.use(create);
router.use(getSingleProject);
router.use(getProjectsRoute);
router.use(updateProjectRoute);
router.use(deleteProjectRoute);
router.use(getProjectScadRoute);
router.use(getProjectStlRoute);

export default router; 