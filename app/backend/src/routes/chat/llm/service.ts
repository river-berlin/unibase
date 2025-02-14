import { Position, GenerateResult } from './types';
import { Database } from '../../../database/types';
import { Kysely } from 'kysely';
import { jsonToScad, scadToStl } from '../../../craftstool/scadify';
import { scadToJson } from '../../../craftstool/scadToJson';
import { basicTools, processTools } from '../../../craftstool/tools';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { getHistoricalMessages } from './helpers/history';
import { addMessages } from './helpers/messages';
import { scadToPng } from '../../../craftstool/openscad';

export async function generateObjects(
  instructions: string,
  existingScad: string | undefined = undefined,
  projectId: string,
  userId: string,
  db: Kysely<Database>,
  openai: OpenAI
): Promise<GenerateResult> {
  existingScad = existingScad?.replace(/undefined/g, "1")
  const historicalMessages = await getHistoricalMessages(projectId, db);

  // Get preview image of current scene if it exists
  let scenePreview = '';
  if (existingScad) {
    try {
      scenePreview = await scadToPng(existingScad);
    } catch (error) {
      console.error('Error generating scene preview:', error);
    }
  }

  // Create messages array with system prompt and history
  const allMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: 'You are a helpful 3D modeling assistant' },
    ...historicalMessages,
    { 
      role: 'user', 
      content: scenePreview ? [
        {
          type: "text",
          text: `Given these instructions and the current 3D scene shown in the image, create or modify the scene using the available tools.\n\nInstructions: ${instructions}`
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${scenePreview}`
          }
        }
      ] : `Given these instructions...${instructions}...`
    }
  ];

  // Track new messages separately
  const newMessages: ChatCompletionMessageParam[] = [
    { 
      role: 'user', 
      content: scenePreview ? [
        {
          type: "text",
          text: `Given these instructions and the current 3D scene shown in the image, create or modify the scene using the available tools.\n\nInstructions: ${instructions}`
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${scenePreview}`
          }
        }
      ] : `Given these instructions...${instructions}...`
    }
  ];

  if (!process.env.OPENAI_MODEL) {
    throw new Error('OPENAI_MODEL is not set');
  }

  let needsToProcessTool = true;
  let sceneObjects = await scadToJson(existingScad || '') || [];
  let errors: string[] = [];
  let numberOfIterations = 0;

  while (needsToProcessTool && numberOfIterations < 5) {
    numberOfIterations++;
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: allMessages,
      tools: basicTools.map(tool => {
        const declaration : any = Object.assign({}, tool.declaration);
        declaration.strict = true;
        return {
          type: 'function',
          function: declaration
        }
      })
    });

    const primaryChoice = completion.choices[0];
    const toolCalls = primaryChoice.message.tool_calls;

    allMessages.push(primaryChoice.message);
    newMessages.push(primaryChoice.message);

    if (toolCalls) {
      const toolCallResults = await processTools(sceneObjects, toolCalls, basicTools);

      for(const toolCall of toolCallResults) {
        let content = toolCall.result ? toolCall.result : toolCall.error;

        if (toolCall.error) {
          errors.push(toolCall.error);
        }

        const toolMessage = {
          role: 'tool',
          content: [{
            type: "text",
            text: content
          }],
          tool_call_id: toolCall.originalToolCall.id
        };
        allMessages.push(toolMessage as ChatCompletionMessageParam);
        newMessages.push(toolMessage as ChatCompletionMessageParam);
      }

      const sceneMessage = {
        role: "user",
        content: [{
          type: "text",
          text: `New scene:\n${jsonToScad(sceneObjects)}, if the changes are done don't make any more changes`
        }]
      };
      allMessages.push(sceneMessage as ChatCompletionMessageParam);
      newMessages.push(sceneMessage as ChatCompletionMessageParam);
    } else {
      needsToProcessTool = false;
    }
  }

  // Generate STL from the scene objects
  let scad: string;
  let stl: string;
  if (sceneObjects.length === 0) {
    scad = '';
    stl = '';
  } else {
    scad = jsonToScad(sceneObjects);
    stl = await scadToStl(scad);
  }

  // Save only the new messages
  const savedMessages = await addMessages(newMessages, projectId, userId, scad, db);

  return {
    messages: savedMessages,
    stl,
    scad
  };
} 