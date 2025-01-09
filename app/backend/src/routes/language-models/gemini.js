import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { DEFAULT_SCENE } from '../../constants/defaults.js';

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
 * @param {Array} currentObjects - Current 3D objects in the scene
 * @param {string} instructions - Natural language instructions for modifying the scene
 * @param {Object} sceneRotation - Current rotation of the scene
 * @param {Object} manualJson - Optional manual JSON input to override generation
 */
async function generateObjects(currentObjects = DEFAULT_SCENE.objects, instructions, sceneRotation = { x: 0, y: 0, z: 0 }, manualJson = null) {
  // If manual JSON is provided, validate it against the documentation
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
            if (!obj.params.size || !obj.params.position) {
              throw new Error('Cube must have size and position parameters');
            }
            break;
          case 'sphere':
            if (!obj.params.radius || !obj.params.position) {
              throw new Error('Sphere must have radius and position parameters');
            }
            break;
          case 'cylinder':
            if (!obj.params.radius || !obj.params.height || !obj.params.position) {
              throw new Error('Cylinder must have radius, height, and position parameters');
            }
            break;
          case 'polyhedron':
            if (!obj.params.points || !obj.params.faces || !obj.params.position) {
              throw new Error('Polyhedron must have points, faces, and position parameters');
            }
            break;
          default:
            throw new Error(`Unknown primitive type: ${obj.type}`);
        }
      }
      
      return {
        objects: manualJson.objects,
        scene: { rotation: sceneRotation },
        reasoning: 'Manual JSON input provided and validated.'
      };
    } catch (error) {
      throw new Error(`Invalid manual JSON: ${error.message}`);
    }
  }

  // If no manual JSON, proceed with generation
  // First, get the reasoning and initial response without JSON schema
  const reasoningModel = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp"
  });
  
  // Generate the prompt for reasoning
  const reasoningPrompt = `You are an expert in 3D modeling. Use the provided primitive documentation to create or modify 3D objects based on natural language instructions.

Current objects in scene (if any):
${JSON.stringify(currentObjects, null, 2)}

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
    model: "gemini-2.0-flash-exp"
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
  const jsonResponse = await jsonResult.response;
  const jsonText = jsonResponse.text();
  
  // Extract the JSON part from the response
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  const parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : { ...DEFAULT_SCENE, scene: { rotation: sceneRotation } };

  return {
    objects: parsedResponse.objects,
    scene: parsedResponse.scene || { rotation: sceneRotation },
    reasoning: fullText
  };
}

/**
 * Generate 3D objects based on natural language instructions
 * 
 * @route POST /language-models/gemini/generate-objects
 */
router.post('/generate-objects', authenticateToken, async (req, res) => {
  try {
    const { 
      currentObjects, 
      instructions, 
      sceneRotation = { x: 0, y: 0, z: 0 }, 
      manualJson = null 
    } = req.body;

    if (!instructions && !manualJson) {
      return res.status(400).json({ 
        error: 'Either instructions or manualJson must be provided' 
      });
    }

    const result = await generateObjects(
      currentObjects,
      instructions,
      sceneRotation,
      manualJson
    );

    res.json(result);
  } catch (error) {
    console.error('Error generating objects:', error);
    res.status(500).json({ 
      error: 'Error generating objects',
      details: error.message 
    });
  }
});

export default router; 