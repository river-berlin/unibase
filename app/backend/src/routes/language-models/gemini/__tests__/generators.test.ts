import { describe, it, expect } from '@jest/globals';
import { generateReasoning } from '../generators/reasoning';
import { generateJson } from '../generators/json';
import { createMockGemini, mockReasoning, mockScene } from './common';
import { GoogleGenerativeAI } from '@google/generative-ai';

describe('Gemini Generators', () => {
  describe('generateReasoning', () => {
    it('should generate reasoning text', async () => {
      const mockGemini = createMockGemini(mockReasoning);
      const result = await generateReasoning(
        'create a cube',
        { x: 0, y: 0, z: 0 },
        null,
        mockGemini
      );

      expect(result).toBe(mockReasoning);
    });

    it('should include existing scene in prompt', async () => {
      let capturedPrompt = '';
      const mockGemini = {
        getGenerativeModel: () => ({
          generateContent: async (prompt: string) => {
            capturedPrompt = prompt;
            return {
              response: {
                text: () => mockReasoning
              }
            };
          }
        })
      } as unknown as GoogleGenerativeAI;

      await generateReasoning(
        'modify the cube',
        { x: 0, y: 0, z: 0 },
        mockScene,
        mockGemini
      );

      expect(capturedPrompt).toContain(JSON.stringify(mockScene, null, 2));
    });
  });

  describe('generateJson', () => {
    it('should generate scene JSON', async () => {
      const mockGemini = createMockGemini(JSON.stringify(mockScene));
      const result = await generateJson(mockReasoning, mockGemini);

      expect(result).toEqual(mockScene);
    });

    it('should throw on invalid JSON', async () => {
      const mockGemini = createMockGemini('invalid json');
      
      await expect(generateJson(mockReasoning, mockGemini))
        .rejects
        .toThrow();
    });
  });
}); 