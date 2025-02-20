import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('messages_new')
		.addColumn('id', 'text', col => col.primaryKey())
		.addColumn('conversation_id', 'text')
		.addColumn('role', 'text')
		.addColumn('content', 'text')  // nullable by default
		.addColumn('tool_calls', 'text')
		.addColumn('tool_call_id', 'text')
		.addColumn('tool_output', 'text')
		.addColumn('input_tokens_used', 'integer')
		.addColumn('output_tokens_used', 'integer')
		.addColumn('error', 'text')
		.addColumn('object_id', 'text')
		.addColumn('created_by', 'text')
		.addColumn('created_at', 'text')
		.addColumn('updated_at', 'text')
		.execute();

	await db.insertInto('messages_new')
		.columns(['id', 'conversation_id', 'role', 'content', 'tool_calls', 'tool_call_id', 'tool_output', 
			'input_tokens_used', 'output_tokens_used', 'error', 'object_id', 'created_by', 'created_at', 'updated_at'])
		.expression(
			db.selectFrom('messages').selectAll()
		)
		.execute();

	await db.schema.dropTable('messages').execute();
	await db.schema.alterTable('messages_new').renameTo('messages').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('messages_new')
		.addColumn('id', 'text', col => col.primaryKey())
		.addColumn('conversation_id', 'text')
		.addColumn('role', 'text')
		.addColumn('content', 'text', col => col.notNull())
		.addColumn('tool_calls', 'text')
		.addColumn('tool_call_id', 'text')
		.addColumn('tool_output', 'text')
		.addColumn('input_tokens_used', 'integer')
		.addColumn('output_tokens_used', 'integer')
		.addColumn('error', 'text')
		.addColumn('object_id', 'text')
		.addColumn('created_by', 'text')
		.addColumn('created_at', 'text')
		.addColumn('updated_at', 'text')
		.execute();

	await db.insertInto('messages_new')
		.columns(['id', 'conversation_id', 'role', 'content', 'tool_calls', 'tool_call_id', 'tool_output', 
			'input_tokens_used', 'output_tokens_used', 'error', 'object_id', 'created_by', 'created_at', 'updated_at'])
		.expression(
			db.selectFrom('messages').selectAll()
		)
		.execute();

	await db.schema.dropTable('messages').execute();
	await db.schema.alterTable('messages_new').renameTo('messages').execute();
}
