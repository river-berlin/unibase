import { Kysely } from 'kysely';
import { SqliteError } from 'better-sqlite3';

export async function up(db: Kysely<any>): Promise<void> {
	try {
		// First drop the tool_outputs column
		await db.schema
			.alterTable('messages')
        .dropColumn('tool_outputs')
        .execute();
	} catch (error) {
		if (error instanceof SqliteError) {
			console.error('Guess the column does not exist');
		} else {
			throw error;
		}
	}

    // Then add the new columns
    await db.schema
        .alterTable('messages')
        .addColumn('tool_call_id', 'text')
        .execute();

	await db.schema
        .alterTable('messages')
        .addColumn('tool_output', 'text')
        .execute();

    // Add index for tool_call_id since we'll be querying on it
    await db.schema
        .createIndex('messages_tool_call_id_idx')
        .on('messages')
        .column('tool_call_id')
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    // Drop the index first
    await db.schema
        .dropIndex('messages_tool_call_id_idx')
        .execute();

    // Remove the new columns
    await db.schema
        .alterTable('messages')
        .dropColumn('tool_call_id')
        .execute();

	await db.schema
        .alterTable('messages')
        .dropColumn('tool_output')
        .execute();

    // Add back the original column
    await db.schema
        .alterTable('messages')
        .addColumn('tool_outputs', 'text')
        .execute();
}