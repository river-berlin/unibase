import request from 'supertest';
import { app } from '../../src/app.js';
import { setupTestUser, cleanupDatabase, setupTestDatabase } from '../setup.js';

describe('Project API', () => {
  let authToken;
  let testUser;
  let organizationId;

  beforeAll(async () => {
    await setupTestDatabase();
    const setup = await setupTestUser();
    authToken = setup.token;
    testUser = setup.user;
    organizationId = setup.organizationId;
  });

  beforeEach(async () => {
    await cleanupDatabase();
    await setupTestDatabase();
    const setup = await setupTestUser();
    authToken = setup.token;
    testUser = setup.user;
    organizationId = setup.organizationId;
  });

  describe('POST /projects', () => {
    it('should create a new project', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'A test project',
        organizationId
      };

      const response = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(projectData.name);
      expect(response.body.description).toBe(projectData.description);
    });

    it('should not create a project without required fields', async () => {
      const response = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name and organizationId are required');
    });
  });

  describe('GET /projects/user/:userId', () => {
    it('should get all projects for a user', async () => {
      // First create some test projects
      const projectData = {
        name: 'Test Project',
        description: 'A test project',
        organizationId: 'test-org-id'
      };

      await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData);

      const response = await request(app)
        .get(`/projects/org/test-org-id`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
    });
  });

  describe('DELETE /projects/:id', () => {
    it('should delete an existing project', async () => {
      // First create a project
      const createResponse = await request(app)
        .post('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Project',
          description: 'A test project',
          organizationId: 'test-org-id'
        });

      const projectId = createResponse.body.id;

      const response = await request(app)
        .delete(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Project deleted successfully');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .delete('/projects/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Project not found');
    });
  });
}); 