import { Router } from 'express';
import createProjectRoute from './create';
import getProjectsRoute from './getAll';
import getSingleProjectRoute from './get';
import updateProjectRoute from './update';
import deleteProjectRoute from './delete';
import getProjectFileRoute from './getProjectFile';

const router = Router();

// Attach all project routes
router.use('/', createProjectRoute);
router.use('/', getProjectsRoute);
router.use('/', getSingleProjectRoute);
router.use('/', updateProjectRoute);
router.use('/', deleteProjectRoute);
router.use('/', getProjectFileRoute);

export default router; 