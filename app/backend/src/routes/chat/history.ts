import { Router, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { AuthenticatedRequest } from './llm/types';

const router = Router();

/**
 * Get chat history for a project
 * 
 * @route GET /chat/llm/:projectId/history
 */
router.get('/:projectId/history', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Chat']
     #swagger.operationId = 'getChatHistory'
     #swagger.summary = 'Get chat history for a project'
     #swagger.description = 'Returns the conversation history including messages and generated objects'
     #swagger.security = [{
       "bearerAuth": []
     }]
     #swagger.parameters['projectId'] = {
       in: 'path',
       description: 'ID of the project to get history for',
       required: true,
       type: 'string',
       format: 'uuid'
     }
     #swagger.responses[200] = {
       description: 'Chat history retrieved successfully',
       content: {
         'application/json': {
           schema: {
             type: 'array',
             items: {
               type: 'object',
               properties: {
                 id: { type: 'string', format: 'uuid' },
                 role: { type: 'string', enum: ['user', 'assistant'] },
                 content: { type: 'string' },
                 tool_calls: { type: 'string', nullable: true },
                 tool_outputs: { type: 'string', nullable: true },
                 object_id: { type: 'string', format: 'uuid', nullable: true },
                 created_at: { type: 'string', format: 'date-time' }
               }
             }
           }
         }
       }
     }
  */
  try {
    const db = req.app.locals.db;

    // Verify project exists and user has access
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
      .where('user_id', '=', req.user!.userId)
      .executeTakeFirst();

    if (!hasAccess) {
      res.status(403).json({ error: 'No access to this project' });
      return;
    }

    // Get messages from active conversation
    const messages = await db
      .selectFrom('messages')
      .innerJoin('conversations', 'conversations.id', 'messages.conversation_id')
      .select([
        'messages.id',
        'messages.role',
        'messages.content',
        'messages.tool_calls',
        'messages.tool_outputs',
        'messages.object_id',
        'messages.created_at'
      ])
      .where('conversations.project_id', '=', req.params.projectId)
      .where('conversations.status', '=', 'active')
      .orderBy('messages.created_at', 'asc')
      .execute();

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ 
      error: 'Error fetching chat history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 