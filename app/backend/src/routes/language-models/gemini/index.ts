import { Router, Response } from 'express';
import { authenticateToken } from '../../../middleware/auth';
import { AuthenticatedRequest } from './types';
import { generateObjects } from './service';

const router = Router();

/**
 * Generate 3D objects based on natural language instructions
 * 
 * @route POST /language-models/gemini/generate-objects/:projectId
 */
router.post('/:projectId/generate-objects', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { 
      instructions, 
      sceneRotation = { x: 0, y: 0, z: 0 }, 
      manualJson = null 
    } = req.body;

    if (!instructions) {
      res.status(400).json({ 
        error: 'Instructions are required' 
      });
      return;
    }

    if (!req.user?.userId) {
      res.status(401).json({ 
        error: 'User not authenticated' 
      });
      return;
    }

    // Verify project exists and user has access
    const db = req.app.locals.db;
    const gemini = req.app.locals.gemini;
    const project = await db
      .selectFrom('projects')
      .select(['organization_id'])
      .where('id', '=', req.params.projectId)
      .executeTakeFirst();

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Check organization access
    const hasAccess = await db
      .selectFrom('organization_members')
      .select('user_id')
      .where('organization_id', '=', project.organization_id)
      .where('user_id', '=', req.user.userId)
      .executeTakeFirst();

    if (!hasAccess) {
      res.status(403).json({ error: 'No access to this project' });
      return;
    }

    const result = await generateObjects(
      instructions,
      sceneRotation,
      manualJson,
      req.params.projectId,
      req.user.userId,
      db,
      gemini
    );

    res.json(result);
  } catch (error) {
    console.error('Error generating objects:', error);
    res.status(500).json({ 
      error: 'Error generating objects',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 