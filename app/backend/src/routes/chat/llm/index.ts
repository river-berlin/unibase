import { Router, Response } from 'express';
import { authenticateToken } from '../../../middleware/auth';
import { AuthenticatedRequest } from './types';
import { generateObjects } from './service';

const router = Router();

router.post('/:projectId/generate-objects', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  /* #swagger.tags = ['Chat']
     #swagger.summary = 'Generate 3D objects based on natural language instructions'
     #swagger.description = 'Uses LLM-based AI models to generate 3D objects and scene state based on text instructions'
     #swagger.operationId = 'generateObjects'
     #swagger.security = [{
       "bearerAuth": []
     }]
     #swagger.parameters['projectId'] = {
       in: 'path',
       description: 'ID of the project to generate objects for',
       required: true,
       type: 'string',
       format: 'uuid'
     }
     #swagger.requestBody = {
       required: true,
       content: {
         'application/json': {
           schema: {
             type: 'object',
             required: ['instructions'],
             properties: {
               instructions: {
                 type: 'string',
                 description: 'Natural language instructions for generating 3D objects',
                 example: 'Create a red cube floating above a blue sphere'
               },
               sceneRotation: {
                 type: 'object',
                 description: 'Current rotation of the scene in radians',
                 properties: {
                   x: { type: 'number', default: 0 },
                   y: { type: 'number', default: 0 },
                   z: { type: 'number', default: 0 }
                 }
               },
               manualJson: {
                 type: 'object',
                 description: 'Optional manual JSON input to override generation',
                 nullable: true
               }
             }
           }
         }
       }
     }
     #swagger.responses[200] = {
       description: 'Objects generated successfully',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               json: {
                 type: 'object',
                 description: 'Generated scene description',
                 properties: {
                   objects: {
                     type: 'array',
                     items: {
                       type: 'object',
                       properties: {
                         type: {
                           type: 'string',
                           enum: ['cube', 'sphere', 'cylinder', 'polyhedron']
                         },
                         params: {
                           type: 'object'
                         },
                         position: {
                           type: 'object',
                           properties: {
                             x: { type: 'number' },
                             y: { type: 'number' },
                             z: { type: 'number' }
                           }
                         }
                       }
                     }
                   },
                   scene: {
                     type: 'object',
                     properties: {
                       rotation: {
                         type: 'object',
                         properties: {
                           x: { type: 'number' },
                           y: { type: 'number' },
                           z: { type: 'number' }
                         }
                       }
                     }
                   }
                 }
               },
               reasoning: {
                 type: 'string',
                 description: 'Step-by-step reasoning for the generation'
               },
               messageId: {
                 type: 'string',
                 format: 'uuid',
                 description: 'ID of the generated message in conversation'
               },
               toolCalls: {
                 type: 'array',
                 items: {
                   type: 'object'
                 }
               },
               errors: {
                 type: 'array',
                 items: {
                   type: 'string'
                 }
               },
               stl: {
                 type: 'string',
                 description: 'STL file for the generated objects'
               },
               scad: {
                 type: 'string',
                 description: 'SCAD file for the generated objects'
               }
             }
           }
         }
       }
     }
     #swagger.responses[400] = {
       description: 'Invalid request parameters',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               error: {
                 type: 'string',
                 example: 'Instructions are required'
               }
             }
           }
         }
       }
     }
     #swagger.responses[401] = {
       description: 'Unauthorized - Missing or invalid token',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               error: {
                 type: 'string',
                 example: 'User not authenticated'
               }
             }
           }
         }
       }
     }
     #swagger.responses[403] = {
       description: 'Forbidden - No access to project',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               error: {
                 type: 'string',
                 example: 'No access to this project'
               }
             }
           }
         }
       }
     }
     #swagger.responses[404] = {
       description: 'Project not found',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               error: {
                 type: 'string',
                 example: 'Project not found'
               }
             }
           }
         }
       }
     }
     #swagger.responses[500] = {
       description: 'Server error',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               error: {
                 type: 'string',
                 example: 'Error generating objects'
               },
               details: {
                 type: 'string',
                 description: 'Additional error details if available'
               }
             }
           }
         }
       }
     }
  */
 
  try {
    const { 
      instructions, 
      sceneRotation = { x: 0, y: 0, z: 0 }
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
    const openai = req.app.locals.openai;

    // Get the latest object for this project if it exists
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
      latestObject?.object || null, // Pass the SCAD content instead of JSON
      req.params.projectId,
      req.user.userId,
      db,
      openai
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