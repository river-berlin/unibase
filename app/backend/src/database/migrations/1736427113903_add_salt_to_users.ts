import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// Add salt column to users table
	await db.schema
		.alterTable('users')
		.addColumn('salt', 'text', (col) => col.notNull().defaultTo(''))
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Remove salt column from users table
	await db.schema
		.alterTable('users')
		.dropColumn('salt')
		.execute();
}
