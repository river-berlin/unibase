import OpenAI from 'openai';
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

export const mockConfirmation = `Yes, we were able to achieve it`;

export function createMockOpenAI(): OpenAI {
  let callCount = 0;
  
  return {
    chat: {
      completions: {
        create: async () => {
          callCount++;
          
          if (callCount === 1) {
            return {
              id: 'mock-completion-id',
              object: 'chat.completion',
              created: Date.now(),
              model: 'gpt-4',
              choices: [{
                index: 0,
                message: {
                  role: 'assistant',
                  content: mockReasoning,
                  tool_calls: [{
                    id: 'call_abc123',
                    type: 'function',
                    function: {
                      name: 'add_cuboid',
                      arguments: JSON.stringify({
                        width: 10,
                        height: 10,
                        depth: 10,
                        objectId: 'test-cube-123'
                      })
                    }
                  }]
                },
                finish_reason: 'tool_calls'
              }]
            };
          } else {
            return {
              id: 'mock-completion-id-2',
              object: 'chat.completion', 
              created: Date.now(),
              model: 'gpt-4',
              choices: [{
                index: 0,
                message: {
                  role: 'assistant',
                  content: mockConfirmation,
                  tool_calls: undefined
                },
                finish_reason: 'stop'
              }]
            };
          }
        }
      }
    }
  } as unknown as OpenAI;
} 