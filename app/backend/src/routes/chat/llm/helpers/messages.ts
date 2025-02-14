import { Kysely, Transaction } from 'kysely';
import { Database } from '../../../../database/types';
import { ExtendedChatMessage } from './history';
import { InsertObject } from 'kysely';
import { v4 as uuidv4 } from 'uuid';

export async function addMessages(
  messages: ExtendedChatMessage[],
  projectId: string,
  userId: string,
  scad: string,
  db: Kysely<Database>
): Promise<ExtendedChatMessage[]> {
  return await db.transaction().execute(async (trx: Transaction<Database>) => {
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
          updated_at: new Date().toISOString()
        })
        .execute();
      conversation = { id: conversationId };
    }

    const objectCreatedAt = new Date().toISOString();
    // Create object record if there's SCAD code
    const objectId = scad ? uuidv4() : null;
    if (objectId) {
      await trx
        .insertInto('objects')
        .values({
          id: objectId,
          object: scad,
          created_at: objectCreatedAt,
          updated_at: objectCreatedAt
        })
        .execute();
    }

    // Normalize message content format
    const normalizedMessages: ExtendedChatMessage[] = [];
    for (const message of messages) {
      let normalizedContent;
      if (typeof message.content === 'string') {
        normalizedContent = [{
          type: "text" as const,
          text: message.content
        }];
      } else {
        normalizedContent = message.content;
      }

      normalizedMessages.push({
        ...message,
        content: normalizedContent
      } as ExtendedChatMessage);
    }

    const databaseMessages: InsertObject<Database, 'messages'>[] = [];
    for (const message of normalizedMessages) {
      databaseMessages.push({
        id: uuidv4(),
        conversation_id: conversation!.id,
        role: message.role as 'system' | 'user' | 'assistant' | 'tool',
        content: JSON.stringify(message.content),
        object_id: (message.role === 'assistant') ? objectId : null,
        tool_call_id: message.tool_call_id,
        tool_calls: message.tool_calls ? JSON.stringify(message.tool_calls) : null,
        tool_output: message.tool_output,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    await trx
      .insertInto('messages')
      .values(databaseMessages)
      .execute();

    await trx
      .updateTable('conversations')
      .set({ updated_at: new Date().toISOString() })
      .where('id', '=', conversation.id)
      .execute();

    return normalizedMessages;
  });
} 