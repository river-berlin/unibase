# Database Schema

## Users Table

Stores user account information.

| Column       | Type    | Description                                    | Index |
|--------------|---------|------------------------------------------------|-------|
| id           | text    | Primary key, UUID                              | PK    |
| email        | text    | User's email address                           | UQ    |
| name         | text    | User's full name                               |       |
| password_hash| text    | Bcrypt hashed password                         |       |
| salt         | text    | Password salt for additional security          |       |
| is_admin     | integer | Whether user has admin privileges (0 or 1)     | IDX   |
| avatar_url   | blob    | JPEG image of user's avatar                    |       |
| last_login_at| text    | Timestamp of last login                        |       |
| created_at   | text    | Timestamp of account creation                  |       |
| updated_at   | text    | Timestamp of last update                       |       |

## Organizations Table

Stores organization information.

| Column      | Type    | Description                                    | Index |
|-------------|---------|------------------------------------------------|-------|
| id          | text    | Primary key, UUID                              | PK    |
| name        | text    | Organization name                              |       |
| description | text    | Organization description (optional)            |       |
| is_default  | integer | Whether this is a default organization (0 or 1)|       |
| created_at  | text    | Timestamp of creation                          |       |
| updated_at  | text    | Timestamp of last update                       |       |

## Organization Members Table

Links users to organizations with roles.

| Column          | Type    | Description                                    | Index |
|-----------------|---------|------------------------------------------------|-------|
| id              | text    | Primary key, UUID                              | PK    |
| organization_id | text    | Foreign key to organizations.id                | FK,IDX|
| user_id         | text    | Foreign key to users.id                        | FK,IDX|
| role            | text    | Member role ('owner', 'admin', 'member')       |       |
| created_at      | text    | Timestamp of creation                          |       |

## Projects Table

Stores project information.

| Column          | Type    | Description                                    | Index |
|-----------------|---------|------------------------------------------------|-------|
| id              | text    | Primary key, UUID                              | PK    |
| name            | text    | Project name                                   |       |
| description     | text    | Project description (optional)                 |       |
| organization_id | text    | Foreign key to organizations.id                | FK,IDX|
| folder_id       | text    | Foreign key to folders.id (optional)           | FK,IDX|
| icon            | text    | Project icon identifier                        |       |
| created_by      | text    | Foreign key to users.id                        | FK,IDX|
| last_modified_by| text    | Foreign key to users.id                        | FK,IDX|
| created_at      | text    | Timestamp of creation                          |       |
| updated_at      | text    | Timestamp of last update                       |       |

## Folders Table

Organizes projects in a hierarchical structure.

| Column          | Type    | Description                                    | Index |
|-----------------|---------|------------------------------------------------|-------|
| id              | text    | Primary key, UUID                              | PK    |
| name            | text    | Folder name                                    |       |
| organization_id | text    | Foreign key to organizations.id                | FK,IDX|
| parent_folder_id| text    | Foreign key to folders.id (optional)           | FK,IDX|
| path            | text    | Full path of the folder                        | IDX   |
| created_at      | text    | Timestamp of creation                          |       |
| updated_at      | text    | Timestamp of last update                       |       |

Legend:
- PK: Primary Key
- FK: Foreign Key
- UQ: Unique Index
- IDX: Non-unique Index 