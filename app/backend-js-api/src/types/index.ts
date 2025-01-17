export type UUID = string;

export interface User {
  id: UUID;
  email: string;
  name: string;
  avatarUrl?: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  organizations?: {
    id: UUID;
    name: string;
    role: string;
  }[];
}

export type OrganizationRole = 'owner' | 'admin' | 'member';

export interface Organization {
  id: UUID;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: UUID;
  name: string;
  description?: string;
  organizationId: UUID;
  folderId?: UUID;
  icon: string;
  createdBy: UUID;
  lastModifiedBy: UUID;
  createdAt: string;
  updatedAt: string;
  sceneState?: SceneState;
}

export interface Folder {
  id: UUID;
  name: string;
  organizationId: UUID;
  parentFolderId?: UUID;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface ApiError {
  error: string;
  status: number;
}

export interface SceneRotation {
  x: number;
  y: number;
  z: number;
}

export interface ScenePosition {
  x: number;
  y: number;
  z: number;
}

export interface Object3DParams {
  size?: number;
  radius?: number;
  height?: number;
  points?: number[][];
  faces?: number[][];
}

export interface Object3D {
  type: 'cube' | 'sphere' | 'cylinder' | 'polyhedron';
  params: Object3DParams;
  position: ScenePosition;
  rotation: SceneRotation;
  isHollow: boolean;
}

export interface SceneState {
  objects: Object3D[];
  scene?: {
    rotation?: {
      x: number;
      y: number;
      z: number;
    };
  };
  reasoning?: string;
} 