CREATE TABLE IF NOT EXISTS "schema_migrations" (version varchar(128) primary key);
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
, stripe_customer_id TEXT);
CREATE INDEX users_is_admin_idx ON users (is_admin);
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE organization_members (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX org_members_org_id_idx ON organization_members (organization_id);
CREATE INDEX org_members_user_id_idx ON organization_members (user_id);
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
CREATE INDEX folders_org_id_idx ON folders (organization_id);
CREATE INDEX folders_parent_id_idx ON folders (parent_folder_id);
CREATE INDEX folders_path_idx ON folders (path);
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
CREATE INDEX projects_org_id_idx ON projects (organization_id);
CREATE INDEX projects_folder_id_idx ON projects (folder_id);
CREATE INDEX projects_created_by_idx ON projects (created_by);
CREATE INDEX projects_modified_by_idx ON projects (last_modified_by);
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  model TEXT NOT NULL,
  status TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE INDEX conversations_project_id_idx ON conversations (project_id);
CREATE INDEX conversations_status_idx ON conversations (status);
CREATE TABLE objects (
  id TEXT PRIMARY KEY,
  object TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
, project_id TEXT REFERENCES projects(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS "messages" (
    id TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
    role TEX
    content TEXT,
    tool_calls TEXT,
    tool_call_id TEXT,
    tool_output TEXT,
    input_tokens_used INTEGER,
    output_tokens_used INTEGER,
    error TEXT,
    created_by TEXT REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT,
    updated_at TEXT
);
-- Dbmate schema migrations
INSERT INTO "schema_migrations" (version) VALUES
  ('20240701000000'),
  ('20240701000001'),
  ('20240701000002'),
  ('20240701000003'),
  ('20240701000004'),
  ('20240701000005'),
  ('20250319101831');
