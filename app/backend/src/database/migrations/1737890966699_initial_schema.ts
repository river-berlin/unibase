import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	// Create Users table
	await db.schema
		.createTable('users')
		.addColumn('id', 'text', col => col.primaryKey())
		.addColumn('email', 'text', col => col.notNull().unique())
		.addColumn('name', 'text', col => col.notNull())
		.addColumn('password_hash', 'text', col => col.notNull())
		.addColumn('salt', 'text', col => col.notNull())
		.addColumn('is_admin', 'integer', col => col.notNull().defaultTo(0))
		.addColumn('avatar', 'blob')
		.addColumn('last_login_at', 'text')
		.addColumn('created_at', 'text', col => col.notNull())
		.addColumn('updated_at', 'text', col => col.notNull())
		.execute()

	// Create index on is_admin
	await db.schema
		.createIndex('users_is_admin_idx')
		.on('users')
		.column('is_admin')
		.execute()

	// Create Organizations table
	await db.schema
		.createTable('organizations')
		.addColumn('id', 'text', col => col.primaryKey())
		.addColumn('name', 'text', col => col.notNull())
		.addColumn('description', 'text')
		.addColumn('is_default', 'integer', col => col.notNull().defaultTo(0))
		.addColumn('created_at', 'text', col => col.notNull())
		.addColumn('updated_at', 'text', col => col.notNull())
		.execute()

	// Create Organization Members table
	await db.schema
		.createTable('organization_members')
		.addColumn('id', 'text', col => col.primaryKey())
		.addColumn('organization_id', 'text', col => 
			col.notNull().references('organizations.id').onDelete('cascade'))
		.addColumn('user_id', 'text', col => 
			col.notNull().references('users.id').onDelete('cascade'))
		.addColumn('role', 'text', col => col.notNull())
		.addColumn('created_at', 'text', col => col.notNull())
		.execute()

	// Create indexes for organization_members
	await db.schema
		.createIndex('org_members_org_id_idx')
		.on('organization_members')
		.column('organization_id')
		.execute()

	await db.schema
		.createIndex('org_members_user_id_idx')
		.on('organization_members')
		.column('user_id')
		.execute()

	// Create Folders table first (since Projects references it)
	await db.schema
		.createTable('folders')
		.addColumn('id', 'text', col => col.primaryKey())
		.addColumn('name', 'text', col => col.notNull())
		.addColumn('organization_id', 'text', col => 
			col.notNull().references('organizations.id').onDelete('cascade'))
		.addColumn('parent_folder_id', 'text', col => 
			col.references('folders.id').onDelete('cascade'))
		.addColumn('path', 'text', col => col.notNull())
		.addColumn('created_at', 'text', col => col.notNull())
		.addColumn('updated_at', 'text', col => col.notNull())
		.execute()

	// Create indexes for folders
	await db.schema
		.createIndex('folders_org_id_idx')
		.on('folders')
		.column('organization_id')
		.execute()

	await db.schema
		.createIndex('folders_parent_id_idx')
		.on('folders')
		.column('parent_folder_id')
		.execute()

	await db.schema
		.createIndex('folders_path_idx')
		.on('folders')
		.column('path')
		.execute()

	// Create Projects table
	await db.schema
		.createTable('projects')
		.addColumn('id', 'text', col => col.primaryKey())
		.addColumn('name', 'text', col => col.notNull())
		.addColumn('description', 'text')
		.addColumn('organization_id', 'text', col => 
			col.notNull().references('organizations.id').onDelete('cascade'))
		.addColumn('folder_id', 'text', col => 
			col.references('folders.id').onDelete('set null'))
		.addColumn('icon', 'text')
		.addColumn('created_by', 'text', col => 
			col.notNull().references('users.id').onDelete('cascade'))
		.addColumn('last_modified_by', 'text', col => 
			col.notNull().references('users.id').onDelete('cascade'))
		.addColumn('created_at', 'text', col => col.notNull())
		.addColumn('updated_at', 'text', col => col.notNull())
		.execute()

	// Create indexes for projects
	await db.schema
		.createIndex('projects_org_id_idx')
		.on('projects')
		.column('organization_id')
		.execute()

	await db.schema
		.createIndex('projects_folder_id_idx')
		.on('projects')
		.column('folder_id')
		.execute()

	await db.schema
		.createIndex('projects_created_by_idx')
		.on('projects')
		.column('created_by')
		.execute()

	await db.schema
		.createIndex('projects_modified_by_idx')
		.on('projects')
		.column('last_modified_by')
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	// Drop tables in reverse order to handle foreign key constraints
	await db.schema.dropTable('projects').execute()
	await db.schema.dropTable('folders').execute()
	await db.schema.dropTable('organization_members').execute()
	await db.schema.dropTable('organizations').execute()
	await db.schema.dropTable('users').execute()
}
