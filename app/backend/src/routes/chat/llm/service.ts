import { Position, GenerateResult } from './types';
import { Database } from '../../../database/types';
import { v4 as uuidv4 } from 'uuid';
import { Kysely, Transaction } from 'kysely';
import { jsonToScad, scadToStl } from '../../../craftstool/scadify';
import { scadToJson } from '../../../craftstool/scadToJson';

// Import all tools
import { basicDeclarationsAndFunctions, processTools } from '../../../craftstool/tools';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

/**
 * Generate 3D objects based on natural language instructions
 */
export async function generateObjects(
  instructions: string,
  sceneRotation: Position = { x: 0, y: 0, z: 0 },
  existingScad: string | undefined = undefined,
  projectId: string,
  userId: string,
  db: Kysely<Database>,
  openai: OpenAI
): Promise<GenerateResult> {
  /* #swagger.tags = ['Language Models']
     #swagger.summary = 'Generate 3D scene from text'
     #swagger.operationId = 'generateSceneFromInstructions'
     #swagger.description = 'Generates a 3D scene based on natural language instructions, using LLM-based AI models to create step-by-step reasoning and JSON scene description'
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
               existingScad: {
                 type: 'string',
                 nullable: true,
                 description: 'Optional existing OpenSCAD code'
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
  existingScad = existingScad?.replace(/undefined/g, "1")
  const existingScadMessage = existingScad ? `Current OpenSCAD code:\n${existingScad}` : 'Starting with empty scene';


  // Create the prompt
  const prompt = `Given these instructions and existing OpenSCAD code, create or modify a 3D scene using the available tools.

Instructions: ${instructions}

Current scene rotation: ${JSON.stringify(sceneRotation)}
${existingScadMessage}

Think through this step by step:
1. What objects need to be created or modified?
2. Where should each object be placed?
3. What rotations are needed?

First explain your reasoning, then use the available tools to create the scene.`;

  if (!process.env.OPENAI_MODEL) {
    throw new Error('OPENAI_MODEL is not set');
  }

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: 'You are a helpful 3D modeling assistant' },
    { role: 'user', content: prompt }
  ];

  let needsToProcessTool = true;
  let sceneObjects = await scadToJson(existingScad || '');
  let errors: string[] = [];
  let completeToolCallResults: { name: string; args: any; result?: any; error?: string; }[] = [];
  let numberOfIterations = 0;

  while (needsToProcessTool && numberOfIterations < 5) {
    numberOfIterations++;
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages,
      tools: basicDeclarationsAndFunctions.map(tool => {
        // @ts-ignore
        tool.declaration.strict = true;
        return {
          type: 'function',
          function: tool.declaration
        }
      })
    });

    
    const primaryChoice = completion.choices[0];
    const toolCalls = primaryChoice.message.tool_calls;

    messages.push(primaryChoice.message);

    if (toolCalls) {
      // Process aggregated tool calls
      const toolCallResults = await processTools(sceneObjects, toolCalls, basicDeclarationsAndFunctions);

      for(const toolCall of toolCallResults) {
        let content = toolCall.result ? toolCall.result : toolCall.error;

        completeToolCallResults.push({
          name: toolCall.originalToolCall.function.name,
          args: toolCall.originalToolCall.function.arguments,
          result: toolCall.result,
          error: toolCall.error
        });


        if (toolCall.error) {
          errors.push(toolCall.error);
        }

        messages.push({
          role: 'tool',
          content: content,
          tool_call_id: toolCall.originalToolCall.id
        });
      }



      messages.push({
        role: "user",
        content: `New scene:\n${jsonToScad(sceneObjects)}, if the changes are done don't make any more changes"`
      });
    } else {
      needsToProcessTool = false;
    }
  }

  let content = "";

  for (const message of messages) {
    if (message.role === 'assistant') {
      content += message.content;
    }
  }

  // Generate STL from the scene objects
  let scad: string;
  let stl: string;
  try {
    if (!sceneObjects || sceneObjects.length === 0) {
      scad = '';
      stl = '';
    } else {
      scad = jsonToScad(sceneObjects);
      stl = await scadToStl(scad);
    }
  } catch (error) {
    errors.push(`Error generating 3D model: ${error instanceof Error ? error.message : String(error)}`);
    scad = '';
    stl = '';
  }

  // Update database with conversation and message
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
          model: process.env.OPENAI_BASE_URL + '--' + process.env.OPENAI_MODEL,
          status: 'active',
          updated_at: now
        })
        .execute();
      conversation = { id: conversationId };
    }

    // Create object record
    const objectId = uuidv4();
    await trx
      .insertInto('objects')
      .values({
        id: objectId,
        object: scad,
        created_at: now,
        updated_at: now
      })
      .execute();

    // Create messages with object_id reference
    const userMessageId = uuidv4();
    const assistantMessageId = uuidv4();

    await trx
      .insertInto('messages')
      .values([
        {
          id: userMessageId,
          conversation_id: conversation.id,
          role: 'user',
          content: instructions,
          tool_calls: null,
          tool_outputs: null,
          object_id: null,
          input_tokens_used: 0,
          output_tokens_used: 0,
          error: null,
          created_by: userId,
          created_at: now,
          updated_at: now
        },
        {
          id: assistantMessageId,
          conversation_id: conversation.id,
          role: 'assistant',
          content: content,
          tool_calls: JSON.stringify(completeToolCallResults),
          tool_outputs: JSON.stringify(sceneObjects),
          object_id: objectId,
          input_tokens_used: 0,
          output_tokens_used: 0,
          error: errors.length > 0 ? JSON.stringify(errors) : null,
          created_by: userId,
          created_at: now,
          updated_at: now
        }
      ])
      .execute();

    await trx
      .updateTable('conversations')
      .set({ updated_at: now })
      .where('id', '=', conversation.id)
      .execute();

    return assistantMessageId;
  });

  const result = {
    json: {
      objects: sceneObjects,
      scene: { rotation: sceneRotation }
    },
    reasoning: content,
    messageId,
    stl,
    scad,
    errors: errors.length > 0 ? errors : undefined,
    toolCalls: completeToolCallResults
  };

  return result
} 