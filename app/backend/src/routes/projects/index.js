import { Router } from 'express';
import createProjectRoute from './create.js';
import getProjectsRoute from './getAll.js';
import getSingleProjectRoute from './getSingle.js';
import updateProjectRoute from './update.js';
import deleteProjectRoute from './delete.js';

const router = Router();

// Attach all project routes
router.use('/', createProjectRoute);
router.use('/', getProjectsRoute);
router.use('/', getSingleProjectRoute);
router.use('/', updateProjectRoute);
router.use('/', deleteProjectRoute);

export default router; 