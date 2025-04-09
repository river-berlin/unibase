import { Router } from 'express';
import create from './create';
import getProjectsRoute from './getAll';
import getSingleProject from './get';
import updateProjectRoute from './update';
import deleteProjectRoute from './delete';
import getProjectScadRoute from './getProjectScad';
import updateProjectScadRoute from './updateProjectScad';
import getProjectScadCode from './getProjectCode';
import updateProjectCodeRoute from './updateProjectCode';
import deleteProjectCodeRoute from './deleteProjectCode';

const router = Router();

router.use(create);
router.use(getSingleProject);
router.use(getProjectsRoute);
router.use(updateProjectRoute);
router.use(deleteProjectRoute);
router.use(getProjectScadRoute);
router.use(updateProjectScadRoute);
router.use(getProjectScadCode);
router.use(updateProjectCodeRoute);
router.use(deleteProjectCodeRoute);

// the getFile route is directly put in the app.js file as that
// does not have any authentication involved

export default router; 