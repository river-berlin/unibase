/**
 * @swagger
 * tags:
 *   name: Health Check
 *   description: API health check and authentication test endpoints
 */

import { Router } from 'express';
import { authenticateToken, isAdmin } from '../../middleware/auth';

const router = Router();

/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Basic health check
 *     description: Returns a simple pong response to verify the API is running
 *     tags: [Health Check]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: pong
 */
router.get('/', (req, res) => {
  res.json({ message: 'pong' });
});

/**
 * @swagger
 * /ping/auth:
 *   get:
 *     summary: Authentication check
 *     description: Verifies that the authentication token is valid and returns user information
 *     tags: [Health Check]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: authenticated pong
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     isAdmin:
 *                       type: boolean
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
router.get('/auth', authenticateToken, (req, res) => {
  res.json({ 
    message: 'authenticated pong',
    user: req.user
  });
});

/**
 * @swagger
 * /ping/admin:
 *   get:
 *     summary: Admin access check
 *     description: Verifies that the user has admin privileges
 *     tags: [Health Check]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User has admin access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: admin pong
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     isAdmin:
 *                       type: boolean
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - User is not an admin
 */
router.get('/admin', authenticateToken, isAdmin, (req, res) => {
  res.json({ 
    message: 'admin pong',
    user: req.user
  });
});

export default router; 