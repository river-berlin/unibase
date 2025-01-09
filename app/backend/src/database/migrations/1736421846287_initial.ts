import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// Create users table
	await db.schema
		.createTable('users')
		.addColumn('id', 'text', col => col.primaryKey().notNull())
		.addColumn('email', 'text', col => col.unique().notNull())
		.addColumn('name', 'text', col => col.notNull())
		.addColumn('password_hash', 'text', col => col.notNull())
		.addColumn('avatar_url', 'text')
		.addColumn('last_login_at', 'text', col => col.notNull())
		.addColumn('created_at', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn('updated_at', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
		.execute();

	// Create organizations table
	await db.schema
		.createTable('organizations')
		.addColumn('id', 'text', col => col.primaryKey().notNull())
		.addColumn('name', 'text', col => col.notNull())
		.addColumn('description', 'text')
		.addColumn('is_default', 'boolean', col => col.notNull().defaultTo(false))
		.addColumn('created_at', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn('updated_at', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
		.execute();

	// Create organization_members table with composite primary key
	await db.schema
		.createTable('organization_members')
		.addColumn('organization_id', 'text', col => 
			col.references('organizations.id').onDelete('cascade').notNull()
		)
		.addColumn('user_id', 'text', col => 
			col.references('users.id').onDelete('cascade').notNull()
		)
		.addColumn('role', 'text', col => col.notNull().check(sql`role IN ('owner', 'admin', 'member')`))
		.addColumn('join_date', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
		.addPrimaryKeyConstraint('organization_members_pkey', ['organization_id', 'user_id'])
		.execute();

	// Create folders table first (since projects can reference folders)
	await db.schema
		.createTable('folders')
		.addColumn('id', 'text', col => col.primaryKey().notNull())
		.addColumn('name', 'text', col => col.notNull())
		.addColumn('organization_id', 'text', col => 
			col.references('organizations.id').onDelete('cascade').notNull()
		)
		.addColumn('parent_folder_id', 'text', col => 
			col.references('folders.id').onDelete('cascade')
		)
		.addColumn('path', 'text', col => col.notNull())
		.addColumn('created_at', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn('updated_at', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
		.execute();

	// Create projects table
	await db.schema
		.createTable('projects')
		.addColumn('id', 'text', col => col.primaryKey().notNull())
		.addColumn('name', 'text', col => col.notNull())
		.addColumn('description', 'text')
		.addColumn('organization_id', 'text', col => 
			col.references('organizations.id').onDelete('cascade').notNull()
		)
		.addColumn('folder_id', 'text', col => 
			col.references('folders.id').onDelete('set null')
		)
		.addColumn('icon', 'text', col => col.notNull())
		.addColumn('created_by', 'text', col => 
			col.references('users.id').onDelete('set null').notNull()
		)
		.addColumn('last_modified_by', 'text', col => 
			col.references('users.id').onDelete('set null').notNull()
		)
		.addColumn('created_at', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn('updated_at', 'text', col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
		.execute();

	// Create indexes
	await db.schema
		.createIndex('idx_users_email')
		.on('users')
		.column('email')
		.execute();

	await db.schema
		.createIndex('idx_folders_path')
		.on('folders')
		.column('path')
		.execute();

	await db.schema
		.createIndex('idx_projects_organization')
		.on('projects')
		.columns(['organization_id', 'folder_id'])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('projects').execute();
	await db.schema.dropTable('folders').execute();
	await db.schema.dropTable('organization_members').execute();
	await db.schema.dropTable('organizations').execute();
	await db.schema.dropTable('users').execute();
}
