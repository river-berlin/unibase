import { Router } from 'express';
import getFolderContentsRoute from './contents';
import getUserFoldersRoute from './allFolders';
import getUserProjectsRoute from './allProjects';
import getFolderHierarchyRoute from './hierarchy';
import createFolderRoute from './create';
import deleteFolderRoute from './delete';

const router = Router();

// Attach all folder routes
router.use('/', getFolderContentsRoute);
router.use('/', getUserFoldersRoute);
router.use('/', getUserProjectsRoute);
router.use('/', getFolderHierarchyRoute);
router.use('/', createFolderRoute);
router.use('/', deleteFolderRoute);

export default router; 