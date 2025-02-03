import { Router, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { AuthenticatedRequest } from '../../types';
import { scadToStl } from '../../craftstool/scadify';

const router = Router();

/**
 * Get latest STL for a project from the messages table
 * 
 * @route GET /projects/:projectId/stl
 */
router.get('/:projectId/stl', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Projects']
     #swagger.summary = 'Get latest STL for a project'
     #swagger.description = 'Get the latest STL for a project. If no objects exist, return an empty string.'
     #swagger.operationId = 'getProjectStl'
     #swagger.security = [{ "bearerAuth": [] }]
     #swagger.parameters = [{
       in: 'path',
       name: 'projectId',
       description: 'The ID of the project',
       required: true,
       type: 'string'
     }]
     #swagger.responses[200] = {
       description: 'Latest STL retrieved successfully',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               stl: {
                 type: 'string',
                 description: 'The STL content. Empty string if no objects exist.'
               }
             }
           }
         }
       }
     } */

  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const db = req.app.locals.db;
    
    // First get the project to check permissions
    const project = await db
      .selectFrom('projects')
      .select(['organization_id'])
      .where('id', '=', req.params.projectId)
      .executeTakeFirst();

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Verify user has access to this project's organization
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

    // Get the latest message with an object for this project
    const latestObject = await db
      .selectFrom('messages')
      .innerJoin('conversations', 'conversations.id', 'messages.conversation_id')
      .leftJoin('objects', 'objects.id', 'messages.object_id')
      .select(['objects.object'])
      .where('conversations.project_id', '=', req.params.projectId)
      .where('messages.object_id', 'is not', null)
      .orderBy('messages.created_at', 'desc')
      .limit(1)
      .executeTakeFirst();

    if (!latestObject || !latestObject.object) {
      // Return empty STL if no objects exist yet
      res.json({ stl: '' });
      return;
    }

    // Convert SCAD to STL
    try {
      const stlData = await scadToStl(latestObject.object);
      res.json({ stl: stlData });
    } catch (error) {
      console.error('Error converting SCAD to STL:', error);
      res.status(500).json({ error: 'Error converting SCAD to STL' });
    }
  } catch (error) {
    console.error('Error fetching project STL:', error);
    res.status(500).json({ error: 'Error fetching project STL' });
  }
});

export default router; 