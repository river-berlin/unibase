import { Router, Response, Request } from 'express';
import { authenticateToken } from '../../../middleware/auth';
import { AuthenticatedUser } from '../../../types';
import Objects from '../../../database/models/objects';
import Projects from '../../../database/models/projects';
import OrganizationMembers from '../../../database/models/organization-members';
import { Conversations } from '../../../database/models';
import { createPrompt, createCompletion} from './helpers/promptGenerator';
import Messages from '../../../database/models/messages';
 

interface RequestBody {
  instructions: string;
  position?: any;
  rotation?: any;
  sceneRotation?: any;
  manualJson?: any | null;
  base64Image: string;
  objects?: Array<{
    type: string;
    params: Record<string, any>;
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    color?: string;
    [key: string]: any;
  }>;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  body: RequestBody;
} 


const router = Router();

router.post('/:projectId/generate-objects', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  /* 
     #swagger.tags = ['Chat']
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
                   minLength: 1,
                   example: 'Create a 3D object based on the instructions'
                 },
                 base64Image: {
                   type: 'string',
                   format: 'base64',
                   description: 'Base64 encoded image of the object'
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
               messageId: {
                 type: 'string',
                 format: 'uuid',
                 description: 'ID of the generated message in conversation'
               },
               messages: {
                 type: 'array',
                 description: 'Chat messages generated during the process',
                 items: {
                   type: 'object',
                   properties: {
                     role: {
                       type: 'string',
                       enum: ['user', 'assistant', 'tool']
                     },
                     content: {
                       type: 'string'
                     },
                     tool_calls: {
                       type: 'array',
                       items: {
                         type: 'object'
                       },
                       nullable: true
                     },
                     tool_outputs: {
                       type: 'array',
                       items: {
                         type: 'object'
                       },
                       nullable: true
                     }
                   }
                 }
               },
               jsContent: {
                 type: 'string',
                 description: 'JavaScript/ThreeJS content for the generated objects'
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
 
  const { instructions, base64Image } = req.body;

  if (!instructions) {
    res.status(400).json({error: 'Instructions are required'});
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
  const objects = (await Objects.findByProject(req.params.projectId, db)) || [];
  const project = await Projects.findById(req.params.projectId, db);
  const conversation = await Conversations.findActiveByProject(project.id, db);

  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  // Check organization access
  const hasAccess = await OrganizationMembers.isMember(project.organization_id, req.user.userId, db);

  if (!hasAccess) {
    res.status(403).json({ error: 'No access to this project' });
    return;
  }

  //const history = await Messages.getMessages(projectId, db);
  const newUserMessage = createPrompt(instructions, conversation.id, req.user.userId, objects, base64Image);
  const newMessages = await createCompletion([newUserMessage], conversation.id, req.user.userId);
  await Messages.addMessages(newMessages, db);

  res.json({ messages : newMessages });
});

export default router; 