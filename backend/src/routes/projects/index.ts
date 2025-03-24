import { Router } from 'express';
import create from './create';
import getProjectsRoute from './getAll';
import getSingleProject from './get';
import updateProjectRoute from './update';
import deleteProjectRoute from './delete';
import getProjectScadRoute from './getProjectScad';
import updateProjectScadRoute from './updateProjectScad';
import getProjectStlRoute from './getProjectStl';
import getProjectScadCode from './getProjectCode';
import updateProjectCodeRoute from './updateProjectCode'

const router = Router();

router.use(create);
router.use(getSingleProject);
router.use(getProjectsRoute);
router.use(updateProjectRoute);
router.use(deleteProjectRoute);
router.use(getProjectScadRoute);
router.use(updateProjectScadRoute);
router.use(getProjectStlRoute);
router.use(getProjectScadCode);
router.use(updateProjectCodeRoute); 

export default router; 