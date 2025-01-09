import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// Add is_admin column to users table
	await db.schema
		.alterTable('users')
		.addColumn('is_admin', 'boolean', (col) => col.notNull().defaultTo(0))
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Remove is_admin column from users table
	await db.schema
		.alterTable('users')
		.dropColumn('is_admin')
		.execute();
}
