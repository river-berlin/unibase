import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Load all messages to update their content format.
  const messages = await db.selectFrom('messages').select(['id', 'content']).execute();

  for (const message of messages) {
    // Build a new JSON string encapsulating the old content.
    const newContent = `{"type": "text", "text": ${JSON.stringify(message.content)}}`;
    await db.updateTable('messages')
      .set({ content: newContent })
      .where('id', '=', message.id)
      .execute();
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  // Reverse the transformation by parsing the JSON and extracting the original text.
  const messages = await db.selectFrom('messages').select(['id', 'content']).execute();

  for (const message of messages) {
    try {
      const parsed = JSON.parse(message.content);
      const originalContent = typeof parsed === 'object' && parsed.text ? parsed.text : message.content;
      await db.updateTable('messages')
        .set({ content: originalContent })
        .where('id', '=', message.id)
        .execute();
    } catch (e) {
      // If parsing fails, leave the content unchanged.
    }
  }
} 