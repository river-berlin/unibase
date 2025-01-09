import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// Add index for faster folder lookups by parent
	await db.schema
		.createIndex('idx_folders_parent')
		.on('folders')
		.columns(['parent_folder_id', 'organization_id'])
		.execute();

	// Add index for faster project lookups by folder
	await db.schema
		.createIndex('idx_projects_folder')
		.on('projects')
		.columns(['folder_id', 'organization_id'])
		.execute();

	// Add index for faster user project lookups
	await db.schema
		.createIndex('idx_projects_created_by')
		.on('projects')
		.columns(['created_by', 'organization_id'])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropIndex('idx_folders_parent').execute();
	await db.schema.dropIndex('idx_projects_folder').execute();
	await db.schema.dropIndex('idx_projects_created_by').execute();
}
