import { Position, Scene, GenerateResult } from './types';
import { generateReasoning } from './generators/reasoning';
import { generateJson } from './generators/json';
import { validateScene } from './validators';
import { Database } from '../../../database/types';
import { v4 as uuidv4 } from 'uuid';
import { Kysely, Transaction } from 'kysely';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generate 3D objects based on natural language instructions
 * 
 * @route POST /language-models/gemini/generate
 */
export async function generateObjects(
  instructions: string,
  sceneRotation: Position = { x: 0, y: 0, z: 0 },
  manualJson: Scene | null = null,
  projectId: string,
  userId: string,
  db: Kysely<Database>,
  gemini: GoogleGenerativeAI
): Promise<GenerateResult> {
  /* #swagger.tags = ['Language Models']
     #swagger.summary = 'Generate 3D scene from text'
     #swagger.operationId = 'generateSceneFromInstructions'
     #swagger.description = 'Generates a 3D scene based on natural language instructions, using Gemini to create step-by-step reasoning and JSON scene description'
     #swagger.security = [{
       "bearerAuth": []
     }]
     #swagger.requestBody = {
       required: true,
       content: {
         'application/json': {
           schema: {
             type: 'object',
             required: ['instructions', 'projectId'],
             properties: {
               instructions: {
                 type: 'string',
                 description: 'Natural language instructions for modifying the scene',
                 example: 'Create a red cube floating above a blue sphere'
               },
               sceneRotation: {
                 type: 'object',
                 properties: {
                   x: { type: 'number', default: 0 },
                   y: { type: 'number', default: 0 },
                   z: { type: 'number', default: 0 }
                 },
                 description: 'Current rotation of the scene in radians'
               },
               manualJson: {
                 type: 'object',
                 nullable: true,
                 description: 'Optional manual JSON input to override generation'
               },
               projectId: {
                 type: 'string',
                 format: 'uuid',
                 description: 'ID of the project to generate scene for'
               }
             }
           }
         }
       }
     }
     #swagger.responses[200] = {
       description: 'Scene generated successfully',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               json: {
                 type: 'object',
                 description: 'Generated scene description in JSON format'
               },
               reasoning: {
                 type: 'string',
                 description: 'Step-by-step reasoning for scene generation'
               },
               messageId: {
                 type: 'string',
                 format: 'uuid',
                 description: 'ID of the generated message in conversation'
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
                 example: 'Invalid manual JSON: Scene validation failed'
               }
             }
           }
         }
       }
     }
     #swagger.responses[401] = {
       description: 'Unauthorized - Missing or invalid token'
     }
     #swagger.responses[403] = {
       description: 'No access to project',
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
     #swagger.responses[500] = {
       description: 'Server error',
       content: {
         'application/json': {
           schema: {
             type: 'object',
             properties: {
               error: {
                 type: 'string',
                 example: 'Error generating scene'
               }
             }
           }
         }
       }
     }
  */
  // Validate manual JSON if provided
  if (manualJson) {
    try {
      validateScene(manualJson);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Invalid manual JSON: ${error.message}`);
      }
      throw error;
    }
  }

  // Generate step-by-step reasoning
  const reasoning = await generateReasoning(instructions, sceneRotation, manualJson, gemini);

  // Convert reasoning to JSON
  const json = await generateJson(reasoning, gemini);

  // Update database with the conversation and message
  const messageId = await db.transaction().execute(async (trx: Transaction<Database>) => {
    const now = new Date().toISOString();

    // Get or create conversation
    let conversation = await trx
      .selectFrom('conversations')
      .select(['id'])
      .where('project_id', '=', projectId)
      .where('status', '=', 'active')
      .executeTakeFirst();

    if (!conversation) {
      const conversationId = uuidv4();
      await trx
        .insertInto('conversations')
        .values({
          id: conversationId,
          project_id: projectId,
          model: 'gemini-2.0-flash-exp',
          status: 'active',
          updated_at: now
        })
        .execute();
      conversation = { id: conversationId };
    }

    // Create user message
    const userMessageId = uuidv4();
    await trx
      .insertInto('messages')
      .values({
        id: userMessageId,
        conversation_id: conversation.id,
        role: 'user',
        content: instructions,
        tool_calls: null,
        tool_outputs: null,
        input_tokens_used: 0,
        output_tokens_used: 0,
        error: null,
        created_by: userId,
        created_at: now,
        updated_at: now
      })
      .execute();

    // Create assistant message
    const assistantMessageId = uuidv4();
    await trx
      .insertInto('messages')
      .values({
        id: assistantMessageId,
        conversation_id: conversation.id,
        role: 'assistant',
        content: reasoning,
        tool_calls: JSON.stringify(json),
        tool_outputs: null,
        input_tokens_used: 0,
        output_tokens_used: 0,
        error: null,
        created_by: userId,
        created_at: now,
        updated_at: now
      })
      .execute();

    // Update conversation timestamp
    await trx
      .updateTable('conversations')
      .set({ updated_at: now })
      .where('id', '=', conversation.id)
      .execute();

    return assistantMessageId;
  });

  return {
    json,
    reasoning,
    messageId
  };
} 