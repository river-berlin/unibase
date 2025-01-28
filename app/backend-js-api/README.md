# Backend JS API Client

A TypeScript library for interacting with the backend API. This library provides a type-safe way to communicate with the backend services.

## Installation

```bash
npm install backend-js-api
```

## Usage

```typescript
import { BackendApi } from 'backend-js-api';

// Initialize the API client
const api = new BackendApi('http://your-api-url');

// Authentication
async function login() {
  try {
    const response = await api.auth.login({
      email: 'user@example.com',
      password: 'password'
    });
  } catch (error) {
    console.error('Login failed:', error);
  }
}

// Projects
async function getProjects(organizationId: string) {
  try {
    const projects = await api.projects.getProjects(organizationId);
    console.log('Projects:', projects);
  } catch (error) {
    console.error('Failed to get projects:', error);
  }
}

// Folders
async function getFolderContents(folderId: string, organizationId: string) {
  try {
    const contents = await api.folders.getFolderContents(folderId, organizationId);
    console.log('Folder contents:', contents);
  } catch (error) {
    console.error('Failed to get folder contents:', error);
  }
}
```

## Features

- Type-safe API client
- Authentication handling
- Project management
- Folder management
- Error handling
- Automatic token management

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Format code
npm run format

# Lint code
npm run lint
```

## API Documentation

### Authentication

- `login(credentials: LoginCredentials)`: Log in a user
- `register(data: RegisterData)`: Register a new user
- `logout()`: Log out the current user

### Projects

- `getProjects(organizationId: string)`: Get all projects in an organization
- `getProject(id: string)`: Get a specific project
- `createProject(data: CreateProjectData)`: Create a new project
- `updateProject(id: string, data: UpdateProjectData)`: Update a project
- `deleteProject(id: string)`: Delete a project
- `generateObjects(projectId: string, data: GenerateObjectsData)`: Generate objects for a project

### Folders

- `getFolders(organizationId: string)`: Get all folders in an organization
- `getFolderContents(folderId: string, organizationId: string)`: Get contents of a folder
- `getProjects(organizationId: string)`: Get all projects in an organization
- `getFolderHierarchy(folderId: string, organizationId: string)`: Get folder hierarchy
- `createFolder(data: CreateFolderData)`: Create a new folder
- `deleteFolder(id: string)`: Delete a folder

## Types

### CreateProjectData
```typescript
{
  name: string;
  description?: string;
  organizationId: string;
  folderId?: string;
  icon?: string;
  file?: {
    name: string;
    type: string;
    content: string;
  };
}
```

### CreateFolderData
```typescript
{
  name: string;
  organizationId: string;
  parentFolderId?: string;
}
```

### FolderContents
```typescript
{
  folders: Folder[];
  projects: Project[];
}
```

## License

ISC 