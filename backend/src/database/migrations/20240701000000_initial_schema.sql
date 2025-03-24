-- migrate:up
-- Create Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0,
  avatar BLOB,
  last_login_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Create index on is_admin
CREATE INDEX users_is_admin_idx ON users (is_admin);

-- Create Organizations table
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Create Organization Members table
CREATE TABLE organization_members (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for organization_members
CREATE INDEX org_members_org_id_idx ON organization_members (organization_id);
CREATE INDEX org_members_user_id_idx ON organization_members (user_id);

-- Create Folders table first (since Projects references it)
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  parent_folder_id TEXT,
  path TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_folder_id) REFERENCES folders(id) ON DELETE CASCADE
);

-- Create indexes for folders
CREATE INDEX folders_org_id_idx ON folders (organization_id);
CREATE INDEX folders_parent_id_idx ON folders (parent_folder_id);
CREATE INDEX folders_path_idx ON folders (path);

-- Create Projects table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  organization_id TEXT NOT NULL,
  folder_id TEXT,
  icon TEXT,
  created_by TEXT NOT NULL,
  last_modified_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (last_modified_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for projects
CREATE INDEX projects_org_id_idx ON projects (organization_id);
CREATE INDEX projects_folder_id_idx ON projects (folder_id);
CREATE INDEX projects_created_by_idx ON projects (created_by);
CREATE INDEX projects_modified_by_idx ON projects (last_modified_by);

-- Create Conversations table
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  model TEXT NOT NULL,
  status TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create indexes for conversations
CREATE INDEX conversations_project_id_idx ON conversations (project_id);
CREATE INDEX conversations_status_idx ON conversations (status);

-- Create Objects table
CREATE TABLE objects (
  id TEXT PRIMARY KEY,
  object TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Create Messages table
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tool_calls TEXT,
  tool_outputs TEXT,
  input_tokens_used INTEGER,
  output_tokens_used INTEGER,
  error TEXT,
  object_id TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for messages
CREATE INDEX messages_conversation_id_idx ON messages (conversation_id);
CREATE INDEX messages_role_idx ON messages (role);
CREATE INDEX messages_created_by_idx ON messages (created_by);
CREATE INDEX messages_object_id_idx ON messages (object_id);

-- migrate:down
-- Drop tables in reverse order to handle foreign key constraints
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS objects;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS folders;
DROP TABLE IF EXISTS organization_members;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS users; 