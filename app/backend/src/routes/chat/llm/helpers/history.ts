import { Kysely } from 'kysely';
import { Database } from '../../../../database/types';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export type ExtendedChatMessage = ChatCompletionMessageParam & {
  tool_call_id?: string;
  tool_output?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export async function getHistoricalMessages(
  projectId: string,
  db: Kysely<Database>
): Promise<ExtendedChatMessage[]> {
  const conversation = await db
    .selectFrom('conversations')
    .select(['id'])
    .where('project_id', '=', projectId)
    .where('status', '=', 'active')
    .executeTakeFirst();

  if (!conversation) return [];

  const messages = await db
    .selectFrom('messages')
    .select([
      'role',
      'content',
      'tool_calls',
      'tool_call_id', 
      'tool_output'
    ])
    .where('conversation_id', '=', conversation.id)
    .where('role', '!=', 'system')
    .orderBy('created_at', 'asc')
    .execute();

  return processMessages(messages);
}

function processMessages(msgs: any[]): ExtendedChatMessage[] {
  const filtered: ExtendedChatMessage[] = [];

  msgs.forEach((msg) => {
    if (msg.role === 'tool') {
      filtered.push({
        role: "tool",
        content: JSON.parse(msg.content),
        tool_call_id: msg.tool_call_id
      });
    } else if (msg.role === 'assistant') {
      const pushMsg = {
        role: "assistant",
        content: JSON.parse(msg.content),
        tool_calls: JSON.parse(msg.tool_calls)||[]
      };
      filtered.push(pushMsg as ExtendedChatMessage);
    } else if (msg.role === 'user') {
      filtered.push({
        role: "user",
        content: JSON.parse(msg.content)
      });
    }
  });

  return filtered;
} 