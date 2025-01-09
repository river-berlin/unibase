# VocalCAD Database Schema

## Core Entities

### User
A user represents an individual account in the system.

**Fields:**
- `id` (UUID): Primary identifier
- `email` (String): User's email address, must be unique
- `name` (String): User's display name
- `password_hash` (String): Securely hashed password
- `avatar_url` (String, optional): URL to user's avatar
- `last_login_at` (Timestamp): Last successful login time
- `created_at` (Timestamp): Account creation time
- `updated_at` (Timestamp): Last account update time

### Organization
Organizations group users and their projects. Every user belongs to at least one organization.

**Fields:**
- `id` (UUID): Primary identifier
- `name` (String): Organization name
- `description` (String, optional): Organization description
- `is_default` (Boolean): Whether this is the default organization
- `created_at` (Timestamp): Creation time
- `updated_at` (Timestamp): Last update time

**Member Roles:**
- Owner: Full control over organization
- Admin: Can manage projects and members
- Member: Can view and edit assigned projects

### Project
A project represents a 3D model with its associated file.

**Fields:**
- `id` (UUID): Primary identifier
- `name` (String): Project name
- `description` (String, optional): Project description
- `organization_id` (UUID): Owning organization
- `folder_id` (UUID, optional): Parent folder
- `icon` (String): MaterialCommunityIcons name for UI
- `created_by` (UUID): User who created the project
- `last_modified_by` (UUID): User who last modified the project
- `created_at` (Timestamp): Creation time
- `updated_at` (Timestamp): Last update time

**File Types:**
1. VocalCAD Native
   - JSON structure for voice-based CAD commands
   - Version controlled
   - Text-based for easy diffing

2. STL Import
   - Binary STL files stored as base64
   - Read-only in the system
   - Used for importing existing models

3. OpenSCAD
   - Text-based OpenSCAD scripts
   - Can be compiled to STL
   - Supports parametric modeling

### Folder
Folders organize projects in a hierarchical structure.

**Fields:**
- `id` (UUID): Primary identifier
- `name` (String): Folder name
- `organization_id` (UUID): Owning organization
- `parent_folder_id` (UUID, optional): Parent folder
- `path` (String): Full path from root (e.g., /work/projects/mechanical)
- `created_at` (Timestamp): Creation time
- `updated_at` (Timestamp): Last update time

## Relationships

```
User ─┬─── OrganizationMember ───┬─── Organization ─┬─── Project ─── ProjectFile
      │                          │                  │
      │                          │                  └─── Folder
      │                          │
      └── created_by/modified_by ┘
```

### Organization Membership
- Users can belong to multiple organizations
- Organizations must have at least one owner
- Membership is tracked in organization_members table with:
  - organization_id
  - user_id
  - role
  - join_date

### Project Organization
- Projects belong to exactly one organization
- Projects can be in one folder or at root level
- Folders can contain both projects and other folders
- Folder paths are materialized for efficient queries

### File Management
- Each project has exactly one associated file
- File content is versioned
- File types are strictly enforced
- All file modifications are tracked with user and timestamp

## Data Integrity Rules

1. **Organizations**
   - Cannot delete organization with owner role
   - Must maintain at least one owner
   - Default org cannot be deleted

2. **Projects**
   - Must have valid file type
   - Must belong to valid organization
   - Can move between folders in same organization

3. **Folders**
   - Cannot create cycles in folder structure
   - Path must match actual hierarchy
   - Must belong to same organization as parent

4. **Users**
   - Email must be valid format
   - Must belong to at least one organization
   - Password must meet security requirements 