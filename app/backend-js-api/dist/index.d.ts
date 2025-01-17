declare class ApiClient {
    protected baseURL: string;
    protected token?: string;
    constructor(baseURL: string);
    setToken(token: string): void;
    clearToken(): void;
    ping(): Promise<boolean>;
    protected request<T>(path: string, options?: RequestInit, queryParams?: Record<string, string>): Promise<T>;
    protected get<T>(path: string, queryParams?: Record<string, string>): Promise<T>;
    protected post<T>(path: string, body: unknown): Promise<T>;
    protected patch<T>(path: string, body: unknown): Promise<T>;
    protected delete<T>(path: string): Promise<T>;
}

type UUID = string;
interface User {
    id: UUID;
    email: string;
    name: string;
    avatarUrl?: string;
    lastLoginAt: string;
    createdAt: string;
    updatedAt: string;
    organizations?: {
        id: UUID;
        name: string;
        role: string;
    }[];
}
type OrganizationRole = 'owner' | 'admin' | 'member';
interface Organization {
    id: UUID;
    name: string;
    description?: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}
interface Project {
    id: UUID;
    name: string;
    description?: string;
    organizationId: UUID;
    folderId?: UUID;
    icon: string;
    createdBy: UUID;
    lastModifiedBy: UUID;
    createdAt: string;
    updatedAt: string;
    sceneState?: SceneState;
}
interface Folder {
    id: UUID;
    name: string;
    organizationId: UUID;
    parentFolderId?: UUID;
    path: string;
    createdAt: string;
    updatedAt: string;
}
interface LoginCredentials {
    email: string;
    password: string;
}
interface RegisterData extends LoginCredentials {
    name: string;
}
interface ApiError {
    error: string;
    status: number;
}
interface SceneRotation {
    x: number;
    y: number;
    z: number;
}
interface ScenePosition {
    x: number;
    y: number;
    z: number;
}
interface Object3DParams {
    size?: number;
    radius?: number;
    height?: number;
    points?: number[][];
    faces?: number[][];
}
interface Object3D {
    type: 'cube' | 'sphere' | 'cylinder' | 'polyhedron';
    params: Object3DParams;
    position: ScenePosition;
    rotation: SceneRotation;
    isHollow: boolean;
}
interface SceneState {
    objects: Object3D[];
    scene?: {
        rotation?: {
            x: number;
            y: number;
            z: number;
        };
    };
    reasoning?: string;
}

declare class AuthService extends ApiClient {
    constructor(baseURL: string);
    login(credentials: LoginCredentials): Promise<{
        token: string;
        user: User;
    }>;
    register(data: RegisterData): Promise<{
        token: string;
        user: User;
    }>;
    logout(): void;
}

interface CreateProjectData {
    name: string;
    description?: string;
    organizationId: UUID;
    folderId?: UUID;
    icon?: string;
    file?: {
        name: string;
        type: string;
        content: string;
    };
}
interface UpdateProjectData {
    name?: string;
    description?: string;
    folderId?: UUID;
    icon?: string;
}
interface GenerateObjectsData {
    currentObjects: Object3D[];
    sceneRotation?: {
        x: number;
        y: number;
        z: number;
    };
    instructions: string;
}
declare class ProjectService extends ApiClient {
    constructor(baseURL: string);
    getProjects(organizationId: UUID): Promise<Project[]>;
    getProject(id: UUID): Promise<Project & {
        sceneState?: SceneState;
    }>;
    createProject(data: CreateProjectData): Promise<Project>;
    updateProject(id: UUID, data: UpdateProjectData): Promise<Project>;
    deleteProject(id: UUID): Promise<void>;
    generateObjects(projectId: UUID, data: GenerateObjectsData): Promise<SceneState>;
}

interface CreateFolderData {
    name: string;
    organizationId: UUID;
    parentFolderId?: UUID;
}
interface UpdateFolderData {
    name?: string;
    parentFolderId?: UUID;
}
interface FolderContents {
    subfolders: Folder[];
    projects: Project[];
}
declare class FolderService extends ApiClient {
    constructor(baseURL: string);
    getFolders(organizationId: UUID): Promise<Folder[]>;
    getFolderContents(folderId: UUID, organizationId: UUID): Promise<FolderContents>;
    getProjects(organizationId: UUID): Promise<Project[]>;
    getFolderHierarchy(folderId: UUID, organizationId: UUID): Promise<Folder[]>;
    createFolder(data: CreateFolderData): Promise<Folder>;
    deleteFolder(id: UUID): Promise<void>;
}

interface GenerateObjectsRequest {
    instructions?: string;
    currentObjects?: Object3D[];
    sceneRotation?: SceneRotation;
    manualJson?: {
        objects: Object3D[];
    };
}
interface GenerateObjectsResponse {
    reasoning: string;
    json: {
        objects: Object3D[];
        scene: {
            rotation: SceneRotation;
        };
    };
}
declare class GeminiService extends ApiClient {
    constructor(baseURL: string);
    /**
     * Generate 3D objects based on natural language instructions or manual JSON input
     * @param params The generation parameters
     * @returns Generated objects, scene information, and reasoning
     */
    generateObjects(params: GenerateObjectsRequest): Promise<GenerateObjectsResponse>;
}

declare class BackendApi extends ApiClient {
    auth: AuthService;
    projects: ProjectService;
    folders: FolderService;
    gemini: GeminiService;
    constructor(baseURL: string);
    setToken(token: string): void;
}

export { type ApiError, AuthService, BackendApi, type CreateFolderData, type CreateProjectData, type Folder, type FolderContents, FolderService, GeminiService, type GenerateObjectsData, type GenerateObjectsRequest, type GenerateObjectsResponse, type LoginCredentials, type Object3D, type Object3DParams, type Organization, type OrganizationRole, type Project, ProjectService, type RegisterData, type ScenePosition, type SceneRotation, type SceneState, type UUID, type UpdateFolderData, type UpdateProjectData, type User, BackendApi as default };
