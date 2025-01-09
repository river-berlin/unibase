import { ApiClient } from '../utils/ApiClient';
import { Folder, UUID, Project } from '../types';

export interface CreateFolderData {
  name: string;
  organizationId: UUID;
  parentFolderId?: UUID;
}

export interface UpdateFolderData {
  name?: string;
  parentFolderId?: UUID;
}

export interface FolderContents {
  subfolders: Folder[];
  projects: Project[];
}

export class FolderService extends ApiClient {
  constructor(baseURL: string) {
    super(baseURL);
  }

  async getFolders(organizationId: UUID): Promise<Folder[]> {
    return this.get<Folder[]>(`/folders/org/${organizationId}`);
  }

  async getFolderContents(folderId: UUID, organizationId: UUID): Promise<FolderContents> {
    return this.get<FolderContents>(`/folders/${folderId}/contents`, { organizationId });
  }

  async getProjects(organizationId: UUID): Promise<Project[]> {
    return this.get<Project[]>(`/folders/projects/org/${organizationId}`);
  }

  async getFolderHierarchy(folderId: UUID, organizationId: UUID): Promise<Folder[]> {
    return this.get<Folder[]>(`/folders/${folderId}/hierarchy`, { organizationId });
  }

  async createFolder(data: CreateFolderData): Promise<Folder> {
    return this.post<Folder>('/folders', data);
  }

  async deleteFolder(id: UUID): Promise<void> {
    return this.delete<void>(`/folders/${id}`);
  }
} 