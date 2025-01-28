import { GoogleGenerativeAI } from '@google/generative-ai';
import { Position, Scene } from '../types';
import { docs } from './docs';

/**
 * Generate step-by-step reasoning for 3D object creation/modification
 */
export async function generateReasoning(
  instructions: string,
  sceneRotation: Position,
  manualJson: Scene | null,
  gemini: GoogleGenerativeAI
): Promise<string> {
  const reasoningModel = gemini.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp"
  });
  
  // Generate the prompt for reasoning
  const reasoningPrompt = `You are an expert in 3D modeling. Use the provided primitive documentation to create or modify 3D objects based on natural language instructions.

Current objects in scene (if any):
${JSON.stringify(manualJson, null, 2)}

Current scene rotation:
${JSON.stringify(sceneRotation, null, 2)}

Instructions: ${instructions}

Please think through this step by step:
1. Understand what objects need to be created or modified
2. Determine if the scene needs to be rotated
3. Determine the appropriate primitive types (cube, sphere, cylinder, polyhedron)
4. Calculate necessary dimensions and positions
5. Consider any rotations needed for individual objects
6. Explain your reasoning for each decision

After explaining your thought process, provide a description of the final objects that should be created and any scene rotation changes.

Here is the complete documentation for the 3D primitive system:

${docs.index}

Detailed documentation for each primitive type:

${docs.cube}

${docs.sphere}

${docs.cylinder}

${docs.polyhedron}`;

  const reasoningResult = await reasoningModel.generateContent(reasoningPrompt);
  const reasoningResponse = await reasoningResult.response;
  return reasoningResponse.text();
} 