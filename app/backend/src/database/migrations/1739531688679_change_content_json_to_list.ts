import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	// Load all messages to update their content format.
	const messages = await db.selectFrom('messages').select(['id', 'content']).execute();

	for (const message of messages) {
		try {
			// Parse the existing content and wrap it in an array
			const existingContent = JSON.parse(message.content);
			const newContent = JSON.stringify([existingContent]);
			
			await db.updateTable('messages')
				.set({ content: newContent })
				.where('id', '=', message.id)
				.execute();
		} catch (e) {
			// If parsing fails, leave the content unchanged
			console.error(`Failed to process message ${message.id}:`, e);
		}
	}
}

export async function down(db: Kysely<any>): Promise<void> {
	// Reverse the transformation by extracting the first element from the array
	const messages = await db.selectFrom('messages').select(['id', 'content']).execute();

	for (const message of messages) {
		try {
			const contentArray = JSON.parse(message.content);
			const originalContent = Array.isArray(contentArray) && contentArray.length > 0 
				? JSON.stringify(contentArray[0]) 
				: message.content;
			
			await db.updateTable('messages')
				.set({ content: originalContent })
				.where('id', '=', message.id)
				.execute();
		} catch (e) {
			// If parsing fails, leave the content unchanged
			console.error(`Failed to process message ${message.id}:`, e);
		}
	}
}
