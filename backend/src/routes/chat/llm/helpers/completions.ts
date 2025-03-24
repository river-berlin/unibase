import { basicTools, processTools } from '../../../../craftstool/tools';
import Messages, { ExtendedChatMessage } from '../../../../database/models/messages';
import Anthropic from '@anthropic-ai/sdk';
import { DB } from '../../../../database/db';
import { 
  createClaudePrompt, 
  createClaudeCompletion
} from './promptGenerator';


export async function runCompletionAndUpdateDatabase(
  instructions: string,
  existingScad: string = '',
  projectId: string,
  userId: string,
  db: DB,
  anthropic: Anthropic,
  sceneImageBase64?: string
) {
  const history = await Messages.getMessages(projectId, db);
  const toolDeclarations = basicTools.map(tool => tool.declaration);

  console.log("generation started")
  const start = Date.now();
  // Create the new user message using the prompt generator, and create the completion
  const newUserMessage = createClaudePrompt(instructions, existingScad, sceneImageBase64);
  const completion = await createClaudeCompletion(anthropic, [newUserMessage], toolDeclarations);
  const end = Date.now();
  console.log(`Generation completed in ${end - start}ms`);

  // Extract tool use blocks from the completion
  const toolUseBlocks = completion.content.filter(block => block.type === 'tool_use');
  const toolResponses = await processTools(existingScad, toolUseBlocks, basicTools);

  // Store it in the database
  const newMessages = [newUserMessage, completion, ...toolResponses.toolResultMessages];
  await Messages.addClaudeMessages(newMessages, projectId, userId, toolResponses.newScad, db);

  return {
    messages: newMessages,
    scad: toolResponses.newScad
  };
}