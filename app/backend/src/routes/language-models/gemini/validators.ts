import { Scene, SceneObject } from './types';

/**
 * Validates a scene object against the schema
 * @throws Error if validation fails
 */
export function validateScene(scene: Scene): void {
  // Basic validation that it follows the documentation format
  if (!Array.isArray(scene.objects)) {
    throw new Error('Manual JSON must contain an "objects" array');
  }
  
  // Validate each object against the documentation
  for (const obj of scene.objects) {
    validateSceneObject(obj);
  }
}

/**
 * Validates a single scene object
 * @throws Error if validation fails
 */
function validateSceneObject(obj: SceneObject): void {
  if (!obj.type || !obj.params) {
    throw new Error('Each object must have a type and params');
  }

  // Validate based on type
  switch (obj.type) {
    case 'cube':
      if (!(obj.params as any).size) {
        throw new Error('Cube must have a size parameter');
      }
      break;
    case 'sphere':
      if (!(obj.params as any).radius) {
        throw new Error('Sphere must have a radius parameter');
      }
      break;
    case 'cylinder':
      if (!(obj.params as any).radius || !(obj.params as any).height) {
        throw new Error('Cylinder must have a radius and height parameter');
      }
      break;
    case 'polyhedron':
      if (!(obj.params as any).points || !(obj.params as any).faces) {
        throw new Error('Polyhedron must have points and faces parameters');
      }
      break;
    case 'cuboid':
      if (!(obj.params as any).width || !(obj.params as any).height || !(obj.params as any).depth) {
        throw new Error('Cuboid must have width, height, and depth parameters');
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