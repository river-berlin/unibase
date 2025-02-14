import { Router } from 'express';
import { getHistoricalMessages } from './llm/helpers/history';

const router = Router();

/**
 * Get chat history for a project
 * 
 * @route GET /chat/llm/:projectId/history
 */
router.get('/:projectId/history', async (req, res) => {
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
                  role: { type: 'string', enum: ['user', 'assistant', 'tool'] },
                  content: { type: 'string' },
                  tool_calls: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        type: { type: 'string', enum: ['function'] },
                        function: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            arguments: { type: 'string' }
                          }
                        }
                      }
                    },
                    nullable: true
                  },
                  tool_call_id: { type: 'string', nullable: true },
                  object_id: { type: 'string', format: 'uuid', nullable: true },
                  created_at: { type: 'string', format: 'date-time' },
                  error: { type: 'string', nullable: true }
                }
              }
            }
          }
        }
      }
  */
  const db = req.app.locals.db;
  try {
    const projectId = req.params.projectId;
    const messages = await getHistoricalMessages(projectId, db);
    
    res.json(messages);
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ error: 'Error getting chat history' });
  }
});

export default router;