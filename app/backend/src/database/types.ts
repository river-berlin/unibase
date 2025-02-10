export interface Database {
  projects: {
    id: string;
    name: string;
    description: string | null;
    organization_id: string;
    folder_id: string | null;
    icon: string;
    created_by: string;
    last_modified_by: string;
    created_at: string;
    updated_at: string;
  };
  organization_members: {
    id: string;
    organization_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member';
    created_at: string;
  };
  organizations: {
    id: string;
    name: string;
    description: string | null;
    is_default: number;
    created_at: string;
    updated_at: string;
  };
  users: {
    id: string;
    email: string;
    name: string;
    password_hash: string;
    salt: string;
    is_admin: number;
    stripe_customer_id: string | null;
    avatar: Buffer | null;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
  };
  folders: {
    id: string;
    name: string;
    organization_id: string;
    parent_folder_id: string | null;
    path: string;
    created_at: string;
    updated_at: string;
  };
  conversations: {
    id: string;
    project_id: string;
    model: string;
    status: 'active' | 'archived' | 'deleted';
    updated_at: string;
  };
  messages: {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    tool_calls: string | null;
    tool_call_id: string | null;
    tool_output: string | null;
    input_tokens_used: number | null;
    output_tokens_used: number | null;
    error: string | null;
    object_id: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
  };
  objects: {
    id: string;
    object: string;
    created_at: string;
    updated_at: string;
  };
} 