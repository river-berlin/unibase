import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { DEFAULT_SCENE } from '../../constants/defaults';

interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
}

interface Position {
  x: number;
  y: number;
  z: number;
}

interface CubeParams {
  size: [number, number, number];
  center?: boolean;
}

interface SphereParams {
  radius: number;
  center?: boolean;
}

interface CylinderParams {
  radius: number;
  height: number;
  center?: boolean;
}

interface PolyhedronParams {
  points: [number, number, number][];
  faces: number[][];
}

interface SceneObject {
  type: 'cube' | 'sphere' | 'cylinder' | 'polyhedron';
  params: CubeParams | SphereParams | CylinderParams | PolyhedronParams;
  position: Position;
  rotation?: Position;
}

interface Scene {
  objects: SceneObject[];
  scene: {
    rotation: Position;
  };
}

interface GenerateResult {
  json: Scene;
  reasoning: string;
}

interface AuthenticatedRequest extends Request {
  user?: User;
  body: {
    instructions: string;
    sceneRotation?: Position;
    manualJson?: Scene | null;
  };
}

const router = Router();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable must be set');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Read primitive documentation
const docsPath = path.join(process.cwd(), 'src', 'docs', 'primitives');
const indexDoc = fs.readFileSync(path.join(docsPath, 'index.md'), 'utf8');
const cubeDoc = fs.readFileSync(path.join(docsPath, 'cube.md'), 'utf8');
const sphereDoc = fs.readFileSync(path.join(docsPath, 'sphere.md'), 'utf8');
const cylinderDoc = fs.readFileSync(path.join(docsPath, 'cylinder.md'), 'utf8');
const polyhedronDoc = fs.readFileSync(path.join(docsPath, 'polyhedron.md'), 'utf8');

/**
 * Generate 3D objects based on natural language instructions
 * 
 * @param instructions - Natural language instructions for modifying the scene
 * @param sceneRotation - Current rotation of the scene
 * @param manualJson - Optional manual JSON input to override generation
 */
async function generateObjects(
  instructions: string,
  sceneRotation: Position = { x: 0, y: 0, z: 0 },
  manualJson: Scene | null = null
): Promise<GenerateResult> {
  // Validate manual JSON if provided, but don't return early
  if (manualJson) {
    try {
      // Basic validation that it follows the documentation format
      if (!Array.isArray(manualJson.objects)) {
        throw new Error('Manual JSON must contain an "objects" array');
      }
      
      // Validate each object against the documentation
      for (const obj of manualJson.objects) {
        if (!obj.type || !obj.params) {
          throw new Error('Each object must have a type and params');
        }
        // Validate based on type
        switch (obj.type) {
          case 'cube':
            if (!(obj.params as CubeParams).size) {
              throw new Error('Cube must have a size parameter');
            }
            break;
          case 'sphere':
            if (!(obj.params as SphereParams).radius) {
              throw new Error('Sphere must have a radius parameter');
            }
            break;
          case 'cylinder':
            if (!(obj.params as CylinderParams).radius || !(obj.params as CylinderParams).height) {
              throw new Error('Cylinder must have a radius and height parameter');
            }
            break;
          case 'polyhedron':
            if (!(obj.params as PolyhedronParams).points || !(obj.params as PolyhedronParams).faces) {
              throw new Error('Polyhedron must have points and faces parameters');
            }
            break;
          default:
            throw new Error(`Unknown primitive type: ${obj.type}`);
        }

        // Check if the object has a position
        if (!obj.position) {
          throw new Error(`Object ${obj.type} must have a position parameter - error object: ${JSON.stringify(obj)}`);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Invalid manual JSON: ${error.message}`);
      }
      throw error;
    }
  }

  const reasoningModel = genAI.getGenerativeModel({ 
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

${indexDoc}

Detailed documentation for each primitive type:

${cubeDoc}

${sphereDoc}

${cylinderDoc}

${polyhedronDoc}`;

  const reasoningResult = await reasoningModel.generateContent(reasoningPrompt);
  const reasoningResponse = await reasoningResult.response;
  const fullText = reasoningResponse.text();

  // Now, extract JSON from the response using a second call
  const jsonModel = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
        responseMimeType: "application/json",
    }
  });
  
  const jsonPrompt = `Convert this 3D modeling description into a valid JSON format following the official documentation.

Description:
${fullText}

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

${indexDoc}

Detailed documentation for each primitive type:

${cubeDoc}

${sphereDoc}

${cylinderDoc}

${polyhedronDoc}

Return only the JSON object containing an "objects" array and a "scene" object following the exact format shown.`;

  const jsonResult = await jsonModel.generateContent(jsonPrompt);
  const jsonResponse = JSON.parse(jsonResult.response.text()) as Scene;
  console.log("jsonResponse", jsonResponse);
  console.log("reasoning", fullText);

  const result: GenerateResult = {
    json: jsonResponse,
    reasoning: fullText
  };

  return result;
}

/**
 * Generate 3D objects based on natural language instructions
 * 
 * @route POST /language-models/gemini/generate-objects
 */
router.post('/generate-objects', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      instructions, 
      sceneRotation = { x: 0, y: 0, z: 0 }, 
      manualJson = null 
    } = req.body;

    if (!instructions) {
      return res.status(400).json({ 
        error: 'Instructions are required' 
      });
    }

    console.log("manualJson", manualJson);

    const result = await generateObjects(
      instructions,
      sceneRotation,
      manualJson
    );

    res.json(result);
  } catch (error) {
    console.error('Error generating objects:', error);
    res.status(500).json({ 
      error: 'Error generating objects',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 