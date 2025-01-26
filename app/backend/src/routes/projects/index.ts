import { Router } from 'express';
import create from './create';
import getProjectsRoute from './getAll';
import getSingleProject from './get';
import updateProjectRoute from './update';
import deleteProjectRoute from './delete';
//import getProjectFileRoute from './getProjectFile';

const router = Router();

router.use(create);
router.use(getSingleProject);
router.use(getProjectsRoute);
router.use(updateProjectRoute);
router.use(deleteProjectRoute);

// Attach all project routes
//router.use('/', getProjectFileRoute);

export default router; 