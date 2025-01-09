import { Router } from 'express';
import getFolderContentsRoute from './contents.js';
import getUserFoldersRoute from './allFolders.js';
import getUserProjectsRoute from './allProjects.js';
import getFolderHierarchyRoute from './hierarchy.js';
import createFolderRoute from './create.js';
import deleteFolderRoute from './delete.js';

const router = Router();

// Attach all folder routes
router.use('/', getFolderContentsRoute);
router.use('/', getUserFoldersRoute);
router.use('/', getUserProjectsRoute);
router.use('/', getFolderHierarchyRoute);
router.use('/', createFolderRoute);
router.use('/', deleteFolderRoute);

export default router; 