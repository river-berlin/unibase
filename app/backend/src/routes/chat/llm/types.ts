import { Request } from 'express';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

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
  type: 'cube' | 'sphere' | 'cylinder' | 'polyhedron' | 'cuboid';
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
  stl: string;
  scad: string;
  messages: ChatCompletionMessageParam[];
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
