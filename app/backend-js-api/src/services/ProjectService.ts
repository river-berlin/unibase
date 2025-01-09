import { ApiClient } from '../utils/ApiClient';
import { Project, UUID, Object3D, SceneState } from '../types';

export interface CreateProjectData {
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

export interface UpdateProjectData {
  name?: string;
  description?: string;
  folderId?: UUID;
  icon?: string;
}

export interface GenerateObjectsData {
  currentObjects: Object3D[];
  sceneRotation?: {
    x: number;
    y: number;
    z: number;
  };
  instructions: string;
}

export class ProjectService extends ApiClient {
  constructor(baseURL: string) {
    super(baseURL);
  }

  async getProjects(organizationId: UUID): Promise<Project[]> {
    return this.get<Project[]>(`/projects/org/${organizationId}`);
  }

  async getProject(id: UUID): Promise<Project & { sceneState?: SceneState }> {
    return this.get<Project & { sceneState?: SceneState }>(`/projects/${id}`);
  }

  async createProject(data: CreateProjectData): Promise<Project> {
    return this.post<Project>('/projects', data);
  }

  async updateProject(id: UUID, data: UpdateProjectData): Promise<Project> {
    return this.patch<Project>(`/projects/${id}`, data);
  }

  async deleteProject(id: UUID): Promise<void> {
    return this.delete<void>(`/projects/${id}`);
  }

  async generateObjects(projectId: UUID, data: GenerateObjectsData): Promise<SceneState> {
    return this.post<SceneState>(`/projects/${projectId}/generate`, data);
  }
} 