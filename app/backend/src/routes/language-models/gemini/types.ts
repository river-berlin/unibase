import { Request } from 'express';

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface CubeParams {
  size: [number, number, number];
  center?: boolean;
}

export interface SphereParams {
  radius: number;
  center?: boolean;
}

export interface CylinderParams {
  radius: number;
  height: number;
  center?: boolean;
}

export interface PolyhedronParams {
  points: [number, number, number][];
  faces: number[][];
}

export interface SceneObject {
  type: 'cube' | 'sphere' | 'cylinder' | 'polyhedron';
  params: CubeParams | SphereParams | CylinderParams | PolyhedronParams;
  position: Position;
  rotation?: Position;
}

export interface Scene {
  objects: SceneObject[];
  scene: {
    rotation: Position;
  };
}

export interface GenerateResult {
  json: Scene;
  reasoning: string;
  messageId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
  params: {
    projectId: string;
  };
  body: {
    instructions: string;
    sceneRotation?: Position;
    manualJson?: Scene | null;
  };
} 
