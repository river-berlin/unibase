import { MessageParam, ContentBlockParam, ImageBlockParam } from '@anthropic-ai/sdk/resources/messages';
import Anthropic from '@anthropic-ai/sdk';
import Messages from '../../../../database/models/messages';
/**
 * Creates a user message for 3D model generation
 * @param instructions - User instructions
 * @param existingScad - Existing SCAD code (optional)
 * @param sceneImageBase64 - Base64 encoded image of the scene (optional)
 * @returns Complete user message
 */
export function   createClaudePrompt(
  instructions: string,
  existingScad?: string,
  sceneImageBase64?: string
): MessageParam {

  const scadExistsTextContent : ContentBlockParam = {
    type: "text",
    text: `Given these instructions and the current 3D scene shown in the image, and the openscad code here - ${existingScad} - create or modify the scene using the available tools.\n\nInstructions: ${instructions}\n\nAlways think step by step and explain your reasoning before calling a tool.`
  }


  const scadDoesNotExistTextContent : ContentBlockParam = {
    type: "text",
    text: `Given these instructions, create the scene in openscad using the available tools.`
  }

  let imageContent : ImageBlockParam | undefined;

  if (sceneImageBase64) {
    imageContent = {
      type: "image",
      source: {
        type: 'base64',
      media_type: 'image/png',
        data: sceneImageBase64.split(',')[1] // remove the data:image/png;base64, prefix
      }
    }
  }

  let content : ContentBlockParam[] = [];

  if (imageContent) {
    content = [scadExistsTextContent, imageContent]
  } else {
    content = [scadDoesNotExistTextContent]
  }

  return {
    role: 'user',
    content: content
  };
}

/**
 * Create a Claude completion
 * @param anthropic - Anthropic client
 * @param messages - Claude messages
 * @param tools - Tools to make available
 * @returns Claude completion
 */
export async function createClaudeCompletion(
  anthropic: Anthropic,
  messages: MessageParam[],
  tools: any[]
) {
  if (!process.env.CLAUDE_MODEL) {
    throw new Error('CLAUDE_MODEL is not set');
  }

  const message = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL,
    messages: messages,
    max_tokens: 4000,
    temperature: 0.7,
    system: "You are a helpful 3D modeling assistant that uses OpenSCAD. You have access to tools that can help create and modify 3D models.",
    tools: tools,
    tool_choice: { type: "auto" }
  });

  message.content = Messages.normalizeMessage(message.content);

  return message;
} 