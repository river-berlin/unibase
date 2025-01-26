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
    created_at: string;
  };
  users: {
    id: string;
    email: string;
    name: string;
    password_hash: string;
    is_admin: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
  };
  folders: {
    id: string;
    name: string;
    path: string;
    organization_id: string;
    parent_folder_id: string | null;
    created_at: string;
    updated_at: string;
  };
} 