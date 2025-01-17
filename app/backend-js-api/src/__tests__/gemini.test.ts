import BackendApi from '../';
import dotenv from 'dotenv';
import { Object3D } from '../types';
import { describe, it, expect, beforeAll } from '@jest/globals';
dotenv.config();

describe('GeminiService Integration Tests', () => {
  let api: BackendApi;
  
  beforeAll(async () => {
    api = new BackendApi(process.env.API_URL || 'http://localhost:3002');
    const response = await api.auth.login({
      email: 'abcdef@b.com',
      password: '123456abc'
    }); 
    api.setToken(response.token);   
  }, 20000);

  describe('generateObjects', () => {
    it('should generate 3D objects from natural language instructions', async () => {
      const instructions = 'Create a red cube with size 2 at position (0,0,0)';
      const result = await api.gemini.generateObjects({ instructions });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.json.objects)).toBe(true);
      expect(result.json.scene).toBeDefined();
      expect(result.json.scene.rotation).toBeDefined();
      expect(result.reasoning).toBeDefined();
      
      // Check the generated object properties
      const [cube] = result.json.objects;
      expect(cube).toBeDefined();
      expect(cube.type).toBe('cube');
      expect(cube.params).toBeDefined();
      expect(cube.params.size).toBe(2);
      expect(cube.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(cube.rotation).toEqual({ x: 0, y: 0, z: 0 });
      expect(cube.isHollow).toBe(false);
    }, 20000);

    it('should handle manual JSON input', async () => {
      const manualJson = {
        objects: [{
          type: 'cube' as const,
          params: {
            size: 2
          },
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          isHollow: false
        }]
      };

      const instructions = 'return the objects as they are';
      const result = await api.gemini.generateObjects({ instructions, manualJson });
      console.log("result", result);
      
      expect(result).toBeDefined();
      expect(result.json.objects).toEqual(manualJson.objects);
      expect(result.json.scene).toBeDefined();
      expect(result.json.scene.rotation).toEqual({ x: 0, y: 0, z: 0 });
    }, 20000);

    it('should handle scene rotation', async () => {
      const instructions = 'Create a sphere and rotate the scene 45 degrees around Y axis';
      const result = await api.gemini.generateObjects({ 
        instructions,
        sceneRotation: { x: 0, y: 45, z: 0 }
      });

      console.log("result 2", result);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.json.objects)).toBe(true);
      expect(result.json.scene.rotation).toEqual({ x: 0, y: 45, z: 0 });
    }, 20000);

    it('should handle errors gracefully', async () => {
      const manualJson = {
        objects: [{
          type: 'cube' as const,
          params: {}, // Missing size parameter
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          isHollow: false
        }]
      };

      const instructions = 'Keep the stuff as it is';

      try {
        await api.gemini.generateObjects({ instructions, manualJson });
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toBe('Invalid manual JSON: Cube must have a size parameter');
      }

    }, 20000);
  });
}); 