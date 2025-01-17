import { AuthService } from './services/AuthService';
import { ProjectService } from './services/ProjectService';
import { FolderService } from './services/FolderService';
import { GeminiService } from './services/GeminiService';
import { ApiClient } from './utils/ApiClient';

export * from './types';
export * from './services/AuthService';
export * from './services/ProjectService';
export * from './services/FolderService';
export * from './services/GeminiService';

export class BackendApi extends ApiClient {
  public auth: AuthService;
  public projects: ProjectService;
  public folders: FolderService;
  public gemini: GeminiService;

  constructor(baseURL: string) {
    super(baseURL);
    this.auth = new AuthService(baseURL);
    this.projects = new ProjectService(baseURL);
    this.folders = new FolderService(baseURL);
    this.gemini = new GeminiService(baseURL);
  }

  setToken(token: string) {
    super.setToken(token);
    this.auth.setToken(token);
    this.projects.setToken(token);
    this.folders.setToken(token);
    this.gemini.setToken(token);
  }
}

export default BackendApi; 