import { ApiClient } from '../utils/ApiClient';
import { SceneRotation, Object3D } from '../types';

export interface GenerateObjectsRequest {
  instructions?: string;
  currentObjects?: Object3D[];
  sceneRotation?: SceneRotation;
  manualJson?: {
    objects: Object3D[];
  };
}

export interface GenerateObjectsResponse {
  reasoning: string;
  json: {
    objects: Object3D[],
    scene: {
      rotation: SceneRotation,
    },
  };
}

export class GeminiService extends ApiClient {
  constructor(baseURL: string) {
    super(baseURL);
  }

  /**
   * Generate 3D objects based on natural language instructions or manual JSON input
   * @param params The generation parameters
   * @returns Generated objects, scene information, and reasoning
   */
  async generateObjects(params: GenerateObjectsRequest): Promise<GenerateObjectsResponse> {
    if (!params.instructions && !params.manualJson) {
      throw new Error('Either instructions or manualJson must be provided');
    }

    try {
      const response = await this.post<GenerateObjectsResponse>(
        '/language-models/gemini/generate-objects',
        params
      );

      return response;
    } catch (error: any) {

      // If it's an API error with details, throw the details message
      if (error.details) {
        throw new Error(error.details);
      }
      // Otherwise throw the original error
      throw error;
    }
  }
} 