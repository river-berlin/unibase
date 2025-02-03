import { Position, Scene, GenerateResult } from './types';
import { FunctionCall, GoogleGenerativeAI } from '@google/generative-ai';
import { Database } from '../../../database/types';
import { v4 as uuidv4 } from 'uuid';
import { Kysely, Transaction } from 'kysely';
import { jsonToScad, scadToStl } from '../../../craftstool/scadify';
import { scadToJson } from '../../../craftstool/scadToJson';

// Import all tools
import { basicDeclarationsAndFunctions } from '../../../craftstool/tools';

/**
 * Generate 3D objects based on natural language instructions
 * 
 * @route POST /language-models/gemini/generate
 */
export async function generateObjects(
  instructions: string,
  sceneRotation: Position = { x: 0, y: 0, z: 0 },
  existingScad: string | undefined = undefined,
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
  existingScad = existingScad?.replace(/undefined/g, "1");

  // Set up the model with tools
  const model = gemini.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    tools: {
      // @ts-ignore
      functionDeclarations: basicDeclarationsAndFunctions.map(tool => tool.declaration)
    }
  });

  // Create the prompt
  const prompt = `You are a 3D scene creation expert. Given these instructions and existing OpenSCAD code, create or modify a 3D scene using the available tools.

Instructions: ${instructions}

Current scene rotation: ${JSON.stringify(sceneRotation)}
${existingScad ? `Current OpenSCAD code:\n${existingScad}` : 'Starting with empty scene'}

Think through this step by step:
1. What objects need to be created or modified?
2. Where should each object be placed?
3. What rotations are needed?

First explain your reasoning, then use the available tools to create the scene.

Available tools:
- add_cube: Creates a cube at origin
- add_cuboid: Creates a cuboid with specified dimensions
- place_object: Positions an object at specific coordinates
- specify_rotation: Sets rotation angles for an object`;

  // Generate the response with reasoning and tool calls
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const response = result.response;
  const reasoning = response.text();
  
  // Execute tool calls in sequence to build the scene
  let sceneObjects = await scadToJson(existingScad || '');
  const errors: string[] = [];


  const toolCallResults: { name: string; args: any; result?: any; error?: string; }[] = [];

  let functionCalls: FunctionCall[] | undefined = undefined;

  if (response.functionCalls) {
    functionCalls = response.functionCalls() || [];

    for (const call of functionCalls) {
      const { name, args } = call;
      const tool = basicDeclarationsAndFunctions.find(tool => tool.declaration.name === name);
      if (tool) {
      try {
        const result = await tool.function(sceneObjects, args);
        toolCallResults.push({ name, args, result })
        
      } catch (error) {
        const errorMsg = `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        toolCallResults.push({ name, args, error: errorMsg });
      }
    } else {
      const errorMsg = `Unknown tool: ${name}`;
      errors.push(errorMsg);
        toolCallResults.push({ name, args, error: errorMsg });
      }
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
          model: 'gemini-2.0-flash-exp',
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
          content: reasoning,
          tool_calls: JSON.stringify(functionCalls),
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

  return {
    json: {
      objects: sceneObjects,
      scene: { rotation: sceneRotation }
    },
    reasoning,
    messageId,
    stl,
    scad,
    errors: errors.length > 0 ? errors : undefined,
    toolCalls: toolCallResults
  };
} 