"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AuthService: () => AuthService,
  BackendApi: () => BackendApi,
  FolderService: () => FolderService,
  GeminiService: () => GeminiService,
  ProjectService: () => ProjectService,
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// src/utils/ApiClient.ts
var ApiClient = class {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }
  setToken(token) {
    this.token = token;
  }
  clearToken() {
    this.token = void 0;
  }
  async ping() {
    try {
      const response = await fetch(`${this.baseURL}/ping`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  async request(path, options = {}, queryParams) {
    const headers = new Headers(options.headers);
    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }
    if (options.body) {
      headers.set("Content-Type", "application/json");
    }
    const url = new URL(`${this.baseURL}${path}`);
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    const response = await fetch(url.toString(), {
      ...options,
      headers
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw {
        ...error,
        status: response.status
      };
    }
    return response.json();
  }
  get(path, queryParams) {
    return this.request(path, { method: "GET" }, queryParams);
  }
  post(path, body) {
    return this.request(path, {
      method: "POST",
      body: JSON.stringify(body)
    });
  }
  patch(path, body) {
    return this.request(path, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  }
  delete(path) {
    return this.request(path, { method: "DELETE" });
  }
};

// src/services/AuthService.ts
var AuthService = class extends ApiClient {
  constructor(baseURL) {
    super(baseURL);
  }
  async login(credentials) {
    const response = await this.post("/auth/login", credentials);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }
  async register(data) {
    const response = await this.post("/auth/register", data);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }
  logout() {
    this.clearToken();
  }
};

// src/services/ProjectService.ts
var ProjectService = class extends ApiClient {
  constructor(baseURL) {
    super(baseURL);
  }
  async getProjects(organizationId) {
    return this.get(`/projects/org/${organizationId}`);
  }
  async getProject(id) {
    return this.get(`/projects/${id}`);
  }
  async createProject(data) {
    return this.post("/projects", data);
  }
  async updateProject(id, data) {
    return this.patch(`/projects/${id}`, data);
  }
  async deleteProject(id) {
    return this.delete(`/projects/${id}`);
  }
  async generateObjects(projectId, data) {
    return this.post(`/projects/${projectId}/generate`, data);
  }
};

// src/services/FolderService.ts
var FolderService = class extends ApiClient {
  constructor(baseURL) {
    super(baseURL);
  }
  async getFolders(organizationId) {
    return this.get(`/folders/org/${organizationId}`);
  }
  async getFolderContents(folderId, organizationId) {
    return this.get(`/folders/${folderId}/contents`, { organizationId });
  }
  async getProjects(organizationId) {
    return this.get(`/folders/projects/org/${organizationId}`);
  }
  async getFolderHierarchy(folderId, organizationId) {
    return this.get(`/folders/${folderId}/hierarchy`, { organizationId });
  }
  async createFolder(data) {
    return this.post("/folders", data);
  }
  async deleteFolder(id) {
    return this.delete(`/folders/${id}`);
  }
};

// src/services/GeminiService.ts
var GeminiService = class extends ApiClient {
  constructor(baseURL) {
    super(baseURL);
  }
  /**
   * Generate 3D objects based on natural language instructions or manual JSON input
   * @param params The generation parameters
   * @returns Generated objects, scene information, and reasoning
   */
  async generateObjects(params) {
    if (!params.instructions && !params.manualJson) {
      throw new Error("Either instructions or manualJson must be provided");
    }
    try {
      const response = await this.post(
        "/language-models/gemini/generate-objects",
        params
      );
      return response;
    } catch (error) {
      if (error.details) {
        throw new Error(error.details);
      }
      throw error;
    }
  }
};

// src/index.ts
var BackendApi = class extends ApiClient {
  constructor(baseURL) {
    super(baseURL);
    this.auth = new AuthService(baseURL);
    this.projects = new ProjectService(baseURL);
    this.folders = new FolderService(baseURL);
    this.gemini = new GeminiService(baseURL);
  }
  setToken(token) {
    super.setToken(token);
    this.auth.setToken(token);
    this.projects.setToken(token);
    this.folders.setToken(token);
    this.gemini.setToken(token);
  }
};
var index_default = BackendApi;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthService,
  BackendApi,
  FolderService,
  GeminiService,
  ProjectService
});
