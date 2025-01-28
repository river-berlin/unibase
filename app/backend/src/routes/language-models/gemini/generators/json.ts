import { GoogleGenerativeAI } from '@google/generative-ai';
import { Scene } from '../types';
import { docs } from './docs';

/**
 * Generate JSON scene description from natural language reasoning
 */
export async function generateJson(
  reasoning: string,
  gemini: GoogleGenerativeAI
): Promise<Scene> {
  const jsonModel = gemini.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });
  
  const jsonPrompt = `Convert this 3D modeling description into a valid JSON format following the official documentation.

Description:
${reasoning}

The JSON should include both the objects array and a scene object with rotation. Example format:
{
  "objects": [...],
  "scene": {
    "rotation": {
      "x": number,
      "y": number,
      "z": number
    }
  }
}

Here is the complete documentation for the 3D primitive system:

${docs.index}

Detailed documentation for each primitive type:

${docs.cube}

${docs.sphere}

${docs.cylinder}

${docs.polyhedron}

Return only the JSON object containing an "objects" array and a "scene" object following the exact format shown.`;

  const jsonResult = await jsonModel.generateContent(jsonPrompt);
  return JSON.parse(jsonResult.response.text()) as Scene;
} 
