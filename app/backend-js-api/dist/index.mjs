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

// src/index.ts
var BackendApi = class extends ApiClient {
  constructor(baseURL) {
    super(baseURL);
    this.auth = new AuthService(baseURL);
    this.projects = new ProjectService(baseURL);
    this.folders = new FolderService(baseURL);
  }
  setToken(token) {
    super.setToken(token);
    this.auth.setToken(token);
    this.projects.setToken(token);
    this.folders.setToken(token);
  }
};
var index_default = BackendApi;
export {
  AuthService,
  BackendApi,
  FolderService,
  ProjectService,
  index_default as default
};
