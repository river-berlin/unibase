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
 * @param instructions - Natural language instructions for modifying the scene
 * @param sceneRotation - Current rotation of the scene
 * @param manualJson - Optional manual JSON input to override generation
 * @param projectId - ID of the project
 * @param userId - ID of the user making the request
 * @param db - Database instance
 * @param gemini - Gemini instance
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