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
| avatar       | blob    | JPEG image of user's avatar                    |       |
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

## Conversations Table

Stores chat/conversation sessions.

| Column          | Type    | Description                                    | Index |
|-----------------|---------|------------------------------------------------|-------|
| id              | text    | Primary key, UUID                              | PK    |
| project_id      | text    | Foreign key to projects.id                     | FK,IDX|
| model           | text    | AI model used (e.g., 'gpt-4o', 'claude-3')     |       |
| status          | text    | Status ('active', 'archived', 'deleted')       | IDX   |
| updated_at      | text    | Timestamp of last update                       |       |

## Messages Table

Links messages to conversations.

| Column            | Type    | Description                                    | Index |
|-------------------|---------|------------------------------------------------|-------|
| id                | text    | Primary key, UUID                              | PK    |
| conversation_id   | text    | Foreign key to conversations.id                | FK    |
| role              | text    | Message role (user/assistant)                  |       |
| content           | text    | Message content                                |       |
| tool_calls        | text    | Tool calls made by assistant (JSON)           |       |
| tool_outputs      | text    | Tool outputs from calls (JSON)                |       |
| input_tokens_used | integer | Number of input tokens used                    |       |
| output_tokens_used| integer | Number of output tokens used                   |       |
| error            | text    | Error message if failed                        |       |
| object_id        | text    | Foreign key to objects.id                      | FK    |
| created_by       | text    | Foreign key to users.id                        | FK    |
| created_at       | text    | Timestamp of creation                          |       |
| updated_at       | text    | Timestamp of last update                       |       |

## Objects Table

Stores 3D objects in OpenSCAD format.

| Column      | Type    | Description                                    | Index |
|-------------|---------|------------------------------------------------|-------|
| id          | text    | Primary key, UUID                              | PK    |
| object      | text    | OpenSCAD object definition                     |       |
| created_at  | text    | Timestamp of creation                          |       |
| updated_at  | text    | Timestamp of last update                       |       |

Legend:
- PK: Primary Key
- FK: Foreign Key
- UQ: Unique Index
- IDX: Non-unique Index 