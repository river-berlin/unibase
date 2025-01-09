import { BackendApi } from '../index';

describe('BackendApi', () => {
  let api: BackendApi;
  const baseURL = 'http://localhost:3000';

  beforeEach(() => {
    api = new BackendApi(baseURL);
    // Mock fetch globally
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('AuthService', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        token: 'test-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          organizations: [{
            id: 'org1',
            name: 'Test Org'
          }]
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await api.auth.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(response.token).toBe('test-token');
      expect(response.user.organizations).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password',
          }),
        })
      );
    });

    it('should handle login error', async () => {
      const errorResponse = {
        error: 'Invalid credentials',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => errorResponse,
      });

      await expect(
        api.auth.login({
          email: 'test@example.com',
          password: 'wrong-password',
        })
      ).rejects.toEqual({
        error: 'Invalid credentials',
        status: 401,
      });
    });
  });

  describe('ProjectService', () => {
    it('should get projects', async () => {
      const mockProjects = [
        {
          id: '1',
          name: 'Test Project',
          description: 'Test description',
          organizationId: 'org1',
          icon: 'cube-outline'
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProjects,
      });

      const response = await api.projects.getProjects('org1');

      expect(response).toEqual(mockProjects);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/projects/org/org1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });
  });

  describe('FolderService', () => {
    it('should get folders', async () => {
      const mockFolders = [
        {
          id: '1',
          name: 'Test Folder',
          organizationId: 'org1',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFolders,
      });

      const response = await api.folders.getFolders('org1');

      expect(response).toEqual(mockFolders);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/folders/org/org1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    it('should get folder contents', async () => {
      const mockContents = {
        subfolders: [
          {
            id: '2',
            name: 'Subfolder',
            organizationId: 'org1',
          },
        ],
        projects: [
          {
            id: '1',
            name: 'Project in folder',
            organizationId: 'org1',
            description: 'Test description',
            icon: 'cube-outline'
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContents,
      });

      const response = await api.folders.getFolderContents('folder1', 'org1');

      expect(response).toEqual(mockContents);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/folders/folder1/contents?organizationId=org1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );
    });

    it('should create folder', async () => {
      const mockFolder = {
        id: '1',
        name: 'New Folder',
        organizationId: 'org1',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFolder,
      });

      const response = await api.folders.createFolder({
        name: 'New Folder',
        organizationId: 'org1',
      });

      expect(response).toEqual(mockFolder);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/folders',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
          body: JSON.stringify({
            name: 'New Folder',
            organizationId: 'org1',
          }),
        })
      );
    });
  });
}); 