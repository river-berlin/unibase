# Database Schema

> **Important Note**: When making changes to the database schema through dbmate migrations, always ensure that the corresponding model files in `src/database/models/` are also updated to maintain consistency between the database schema and the application code.

## Users Table

Stores user account information.

| Column       | Type    | Description                                    | Index |
|--------------|---------|------------------------------------------------|-------|
| id           | text    | Primary key, UUID                              | PK    |
| email        | text    | User's email address                           | UQ    |
| name         | text    | User's full name                               |       |
| username     | text    | User's unique username                         | UQ    |
| password_hash| text    | Bcrypt hashed password                         |       |
| salt         | text    | Password salt for additional security          |       |
| is_admin     | integer | Whether user has admin privileges (0 or 1)     | IDX   |
| avatar       | blob    | JPEG image of user's avatar                    |       |
| last_login_at| text    | Timestamp of last login                        |       |
| created_at   | text    | Timestamp of account creation                  |       |
| updated_at   | text    | Timestamp of last update                       |       |
| stripe_customer_id | text | Stripe customer ID (nullable)               |       |

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
| use_for_training| integer | Whether to use project for training (0 or 1)   |       |

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
| model           | text    | AI model used (e.g., 'gpt-4o-latest', 'claude-3.7-someversionnumber')     |       |
| status          | text    | Status ('active', 'archived', 'deleted')       | IDX   |
| updated_at      | text    | Timestamp of last update                       |       |

## Messages Table

Stores messages in conversations.

| Column            | Type    | Description                                    | Index |
|-------------------|---------|------------------------------------------------|-------|
| id                | text    | Primary key, UUID                              | PK    |
| conversation_id   | text    | Foreign key to conversations.id                | FK    |
| role              | text    | Message role (user/assistant/tool/system)      |       |
| content           | text    | Message content                                |       |
| tool_calls        | text    | Tool calls made by assistant (JSON)            |       |
| tool_call_id      | text    | ID of the tool call (only for role='tool')     |       |
| tool_output       | text    | Tool output (only for role='tool')             |       |
| already_trained   | boolean | Whether this message has been used as training data | IDX   |
| trained_at        | text    | Timestamp when the message was used for training |       |
| input_tokens_used | integer | Number of input tokens used                    |       |
| output_tokens_used| integer | Number of output tokens used                   |       |
| error             | text    | Error message if failed                        |       |
| created_by        | text    | Foreign key to users.id                        | FK    |
| created_at        | text    | Timestamp of creation                          |       |
| updated_at        | text    | Timestamp of last update                       |       |

## Objects Table

Stores 3D objects in Javascript format.

| Column      | Type    | Description                                    | Index |
|-------------|---------|------------------------------------------------|-------|
| id          | text    | Primary key, UUID                              | PK    |
| object      | text    | Object definition                              |       |
| project_id  | text    | Foreign key to projects.id                     | FK    |
| filepath    | text    | Path to the file (optional)                    |       |
| filename    | text    | Name of the file (optional)                    |       |
| created_at  | text    | Timestamp of creation                          |       |
| updated_at  | text    | Timestamp of last update                       |       |

Legend:
- PK: Primary Key
- FK: Foreign Key
- UQ: Unique Index
- IDX: Non-unique Index