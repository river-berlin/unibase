# Database Schema

## Users Table

Stores user account information.

| Column        | Type    | Description                                      |
|--------------|---------|--------------------------------------------------|
| id           | text    | Primary key, UUID                                |
| email        | text    | User's email address (unique)                    |
| name         | text    | User's full name                                 |
| password_hash| text    | Bcrypt hashed password                           |
| salt         | text    | Password salt for additional security            |
| is_admin     | boolean | Whether user has admin privileges                |
| avatar_url   | text    | URL to user's avatar image (optional)           |
| last_login_at| text    | Timestamp of last login                         |
| created_at   | text    | Timestamp of account creation                    |
| updated_at   | text    | Timestamp of last update                        |

## Organizations Table

Stores organization information.

| Column      | Type    | Description                                      |
|------------|---------|--------------------------------------------------|
| id         | text    | Primary key, UUID                                |
| name       | text    | Organization name                                |
| description| text    | Organization description (optional)              |
| is_default | boolean | Whether this is a default organization           |
| created_at | text    | Timestamp of creation                           |
| updated_at | text    | Timestamp of last update                        |

## Organization Members Table

Links users to organizations with roles.

| Column          | Type    | Description                                      |
|----------------|---------|--------------------------------------------------|
| organization_id| text    | Foreign key to organizations.id                  |
| user_id        | text    | Foreign key to users.id                          |
| role           | text    | Member role ('owner', 'admin', 'member')         |
| join_date      | text    | Timestamp when user joined organization          |

Primary Key: (organization_id, user_id)

## Projects Table

Stores project information.

| Column           | Type    | Description                                      |
|-----------------|---------|--------------------------------------------------|
| id              | text    | Primary key, UUID                                |
| name            | text    | Project name                                     |
| description     | text    | Project description (optional)                   |
| organization_id | text    | Foreign key to organizations.id                  |
| folder_id       | text    | Foreign key to folders.id (optional)            |
| icon            | text    | Project icon identifier                          |
| created_by      | text    | Foreign key to users.id                         |
| last_modified_by| text    | Foreign key to users.id                         |
| created_at      | text    | Timestamp of creation                           |
| updated_at      | text    | Timestamp of last update                        |

## Folders Table

Organizes projects in a hierarchical structure.

| Column           | Type    | Description                                      |
|-----------------|---------|--------------------------------------------------|
| id              | text    | Primary key, UUID                                |
| name            | text    | Folder name                                      |
| organization_id | text    | Foreign key to organizations.id                  |
| parent_folder_id| text    | Foreign key to folders.id (optional)            |
| path            | text    | Full path of the folder                         |
| created_at      | text    | Timestamp of creation                           |
| updated_at      | text    | Timestamp of last update                        | 