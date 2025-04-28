import Messages, { MessageData } from '../../../../database/models/messages';
import { ObjectWithMessageData } from '../../../../database/models';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { openrouter } from '@openrouter/ai-sdk-provider';

import { generateText, ImagePart, TextPart, UserContent } from 'ai';
import { aiSdkTools } from '../../../../craftstool/tools';
import { MODELING_SYSTEM_PROMPT } from './prompts';

function getFileContents(objects: ObjectWithMessageData[]): string{
  let filesContent = '';
  for (const object of objects) {
    filesContent += `\n\n### File: ${object.filename || 'Unnamed file'} (ID: ${object.id})\n\`\`\`javascript\n${object.object}\n\`\`\``;
  }

  if(objects.length == 0){
    return "No files are currently present"
  }

  return filesContent
}

/**
 * Creates a user message for 3D model generation with JavaScript/ThreeJS
 * @param instructions - User instructions
 * @param existingContent - Existing JavaScript/ThreeJS code
 * @param sceneImageBase64 - Base64 encoded image of the scene (optional)
 * @param objects - Array of existing objects to modify (optional)
 * @returns Complete user message
 */
export function createPrompt(
  instructions: string,
  conversationId: string,
  userId: string,
  objects: ObjectWithMessageData[]
): MessageData {

  // Format each file in a markdown code block with the filename
  let filesContents = getFileContents(objects)

  const textContent: TextPart = {
    type: "text",
    text: `
    Current File Contents :
    ${filesContents}
    ----------
    
    User provided prompt :
    ${instructions}`
  }

  let content: UserContent = [textContent];
  
  return {
    role: "user",
    conversation_id: conversationId,
    content: Messages.normalizeMessageContent(content), // Keep the original content structure
    created_by: userId
  }
}

/**
 * Create an llm completion
 * @param messages - llm messages to generate stuff using
 * @returns provided message + newly generated messages by the llm, you can store this in the database
 */
export async function createCompletion(
  messages: MessageData[],
  conversationId: string,
  userId: string
) : Promise<MessageData[]> {
  if (!process.env.LLM_MODEL) {
    throw new Error('LLM_MODEL is not set');
  }

  const newMessages : MessageData[] = [];

  let model;

  if (process.env.LLM_PROVIDER === 'openai') {
    model = openai(process.env.LLM_MODEL);
  } else if (process.env.LLM_PROVIDER === 'anthropic') {
    model = anthropic(process.env.LLM_MODEL);
  } else if (process.env.LLM_PROVIDER === 'google') {
    model = google(process.env.LLM_MODEL);
  } else if (process.env.LLM_PROVIDER === 'openrouter') {
    model = openrouter(process.env.LLM_MODEL);
  } else {
    throw new Error('Invalid LLM_PROVIDER');
  }
    
  

  await generateText({
    model,
    messages,
    system: MODELING_SYSTEM_PROMPT,
    tools : aiSdkTools,
    maxSteps: 3,
    seed: 0,
    onStepFinish(response) {
      const { stepType, text, toolCalls, toolResults, finishReason, usage } = response

      console.log("response-->", response)
      
      newMessages.push({
        role: 'assistant',
        content: Messages.normalizeMessageContent(text),
        tool_calls: toolCalls,
        tool_output: toolResults,
        conversation_id: conversationId,
        created_by: userId
      });
    },
  });

  return [...messages, ...newMessages];
} 