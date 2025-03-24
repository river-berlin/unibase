/**
 * @swagger
 * tags:
 *   name: Admin Users
 *   description: User management endpoints for administrators
 */

import { Router } from 'express';
import listRoute from './list';
import updateRoleRoute from './updateRole';
import deleteRoute from './delete';

const router = Router();

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users
 *     description: Retrieves a paginated list of all users. Only accessible by admin users.
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional search term to filter users
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - User is not an admin
 */
router.use('/', listRoute);

/**
 * @swagger
 * /admin/users/{userId}/role:
 *   put:
 *     summary: Update user role
 *     description: Updates a user's admin status. Only accessible by admin users.
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isAdmin
 *             properties:
 *               isAdmin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - User is not an admin or trying to modify own status
 *       404:
 *         description: User not found
 */
router.use('/', updateRoleRoute);

/**
 * @swagger
 * /admin/users/{userId}:
 *   delete:
 *     summary: Delete user
 *     description: Deletes a user and all their associated data. Only accessible by admin users.
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - User is not an admin or trying to delete own account
 *       404:
 *         description: User not found
 */
router.use('/', deleteRoute);

export default router; 