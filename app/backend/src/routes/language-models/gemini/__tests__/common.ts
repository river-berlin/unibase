import { GoogleGenerativeAI } from '@google/generative-ai';
import { Scene } from '../types';

export const mockScene: Scene = {
  objects: [
    {
      type: 'cube',
      params: {
        size: [1, 1, 1]
      },
      position: { x: 0, y: 0, z: 0 }
    }
  ],
  scene: {
    rotation: { x: 0, y: 0, z: 0 }
  }
};

export const mockReasoning = `I will create a simple cube at the origin.
1. We don't need to rotate the scene
2. A cube primitive is perfect for this
3. Using unit dimensions (1x1x1) for simplicity
4. Placing it at the origin (0,0,0)`;

export function createMockGemini(
  mockResponse: string = JSON.stringify(mockScene)
): GoogleGenerativeAI {
  return {
    getGenerativeModel: () => ({
      generateContent: async () => ({
        response: {
          text: () => mockResponse
        }
      })
    })
  } as unknown as GoogleGenerativeAI;
} 