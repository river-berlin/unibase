import BackendApi from '../../src';
import dotenv from 'dotenv';

dotenv.config();

describe('GeminiService Integration Tests', () => {
  let api: BackendApi;
  
  beforeAll(async () => {
    api = new BackendApi(process.env.API_URL || 'http://localhost:3002');
    // Login and set token if needed
    if (process.env.TEST_EMAIL && process.env.TEST_PASSWORD) {
      const response = await api.auth.login(process.env.TEST_EMAIL, process.env.TEST_PASSWORD);
      api.setToken(response.token);
    }
  });

  describe('generateObjects', () => {
    it('should generate 3D objects from natural language instructions', async () => {
      const instructions = 'Create a red cube with size 2 at position (0,0,0)';
      const result = await api.gemini.generateObjects({ instructions });
      
      expect(result).toBeDefined();
      expect(result.objects).toBeInstanceOf(Array);
      expect(result.scene).toBeDefined();
      expect(result.scene.rotation).toBeDefined();
      expect(result.reasoning).toBeDefined();
      
      // Check the generated object properties
      const [cube] = result.objects;
      expect(cube).toBeDefined();
      expect(cube.type).toBe('cube');
      expect(cube.params).toBeDefined();
      expect(cube.params.size).toBe(2);
      expect(cube.params.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(cube.params.color).toBe('red');
    });

    it('should handle manual JSON input', async () => {
      const manualJson = {
        objects: [{
          type: 'cube',
          params: {
            size: 2,
            position: { x: 0, y: 0, z: 0 },
            color: 'blue'
          }
        }]
      };

      const result = await api.gemini.generateObjects({ manualJson });
      
      expect(result).toBeDefined();
      expect(result.objects).toEqual(manualJson.objects);
      expect(result.scene).toBeDefined();
      expect(result.scene.rotation).toEqual({ x: 0, y: 0, z: 0 });
      expect(result.reasoning).toBe('Manual JSON input provided and validated.');
    });

    it('should handle scene rotation', async () => {
      const instructions = 'Create a sphere and rotate the scene 45 degrees around Y axis';
      const result = await api.gemini.generateObjects({ 
        instructions,
        sceneRotation: { x: 0, y: 45, z: 0 }
      });
      
      expect(result).toBeDefined();
      expect(result.objects).toBeInstanceOf(Array);
      expect(result.scene.rotation).toEqual({ x: 0, y: 45, z: 0 });
    });

    it('should handle errors gracefully', async () => {
      const manualJson = {
        objects: [{
          type: 'invalid_type',
          params: {}
        }]
      };

      await expect(api.gemini.generateObjects({ manualJson }))
        .rejects
        .toThrow('Unknown primitive type: invalid_type');
    });
  });
}); 