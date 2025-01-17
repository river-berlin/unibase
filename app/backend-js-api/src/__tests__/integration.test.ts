import { BackendApi } from '../index';
import { describe, it, expect, beforeAll } from '@jest/globals';

const INTEGRATION_TEST = process.env.RUN_INTEGRATION_TESTS === 'true';
const describeIntegration = INTEGRATION_TEST ? describe : describe.skip;

describeIntegration('BackendApi Integration Tests', () => {
  let api: BackendApi;
  let authToken: string;
  let organizationId: string;

  beforeAll(async () => {
    api = new BackendApi('http://localhost:3002');
    
    const isAlive = await api.ping();
    if (!isAlive) {
      throw new Error('Server is not responding to ping');
    }
    
    const response = await api.auth.login({
      email: 'abcdef@b.com',
      password: '123456abc'
    });
    
    authToken = response.token;
    api.setToken(authToken);
    organizationId = response.user.organizations?.[0]?.id || '';
    
    if (!organizationId) {
      throw new Error('No organization found for test user');
    }
  });

  describe('Folders', () => {
    let testFolderId: string;

    it('should create a folder', async () => {
      const folderName = `Test Folder ${Date.now()}`;
      const folder = await api.folders.createFolder({
        name: folderName,
        organizationId
      });

      expect(folder.name).toBe(folderName);
      expect(folder.id).toBeDefined();
      testFolderId = folder.id;
    });

    it('should list folders', async () => {
      const folders = await api.folders.getFolders(organizationId);
      expect(Array.isArray(folders)).toBe(true);
      expect(folders.some(f => f.id === testFolderId)).toBe(true);
    });

    it('should get folder contents', async () => {
      const contents = await api.folders.getFolderContents(testFolderId, organizationId);
      console.log('Folder contents:', contents);
      expect(contents).toHaveProperty('subfolders');
      expect(contents).toHaveProperty('projects');
      expect(Array.isArray(contents.subfolders)).toBe(true);
      expect(Array.isArray(contents.projects)).toBe(true);
    });

    afterAll(async () => {
      if (testFolderId) {
        await api.folders.deleteFolder(testFolderId);
      }
    });
  });

  describe('Projects', () => {
    let testProjectId: string;

    it('should create a project', async () => {
      const projectName = `Test Project ${Date.now()}`;
      const project = await api.projects.createProject({
        name: projectName,
        description: 'Integration test project',
        organizationId,
        icon: 'cube-outline'
      });

      expect(project.name).toBe(projectName);
      expect(project.id).toBeDefined();
      testProjectId = project.id;
    });

    it('should list projects', async () => {
      const projects = await api.projects.getProjects(organizationId);
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.some(p => p.id === testProjectId)).toBe(true);
    });

    it('should update a project', async () => {
      const newName = `Updated Project ${Date.now()}`;
      const updated = await api.projects.updateProject(testProjectId, {
        name: newName
      });

      expect(updated.name).toBe(newName);
    });

    it('should get a single project', async () => {
      const project = await api.projects.getProject(testProjectId);
      expect(project.id).toBe(testProjectId);
    });

    afterAll(async () => {
      if (testProjectId) {
        await api.projects.deleteProject(testProjectId);
      }
    });
  });
}); 