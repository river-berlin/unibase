import request from 'supertest';
import { app } from '../../src/app.js';

describe('Project API', () => {
  const testUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  };

  beforeEach(() => {
    // Clear projects before each test
    global.projects = new Map();
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'A test project',
        userId: testUser.id
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(projectData.name);
      expect(response.body.description).toBe(projectData.description);
      expect(response.body.userId).toBe(testUser.id);
    });

    it('should not create a project without required fields', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          description: 'Missing name and userId'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name and userId are required');
    });
  });

  describe('GET /api/projects/user/:userId', () => {
    it('should get all projects for a user', async () => {
      // Create test projects
      const projects = [
        {
          name: 'Project 1',
          description: 'First project',
          userId: testUser.id
        },
        {
          name: 'Project 2',
          description: 'Second project',
          userId: testUser.id
        }
      ];

      // Add projects to storage
      for (const project of projects) {
        await request(app)
          .post('/api/projects')
          .send(project);
      }

      const response = await request(app)
        .get(`/api/projects/user/${testUser.id}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].userId).toBe(testUser.id);
      expect(response.body[1].userId).toBe(testUser.id);
    });

    it('should return empty array for user with no projects', async () => {
      const response = await request(app)
        .get('/api/projects/user/non-existent-user');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete an existing project', async () => {
      // Create a project first
      const createResponse = await request(app)
        .post('/api/projects')
        .send({
          name: 'Project to Delete',
          description: 'This project will be deleted',
          userId: testUser.id
        });

      const projectId = createResponse.body.id;

      const response = await request(app)
        .delete(`/api/projects/${projectId}`);

      expect(response.status).toBe(204);

      // Verify project was deleted
      const getResponse = await request(app)
        .get(`/api/projects/user/${testUser.id}`);
      expect(getResponse.body.find(p => p.id === projectId)).toBeUndefined();
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .delete('/api/projects/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Project not found');
    });
  });
}); 