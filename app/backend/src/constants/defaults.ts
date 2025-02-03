interface Position {
  x: number;
  y: number;
  z: number;
}

interface SphereParams {
  radius: number;
}

interface CubeParams {
  size: [number, number, number];
}

interface CylinderParams {
  radius: number;
  height: number;
}

interface SceneObject {
  type: 'sphere' | 'cube' | 'cylinder';
  params: SphereParams | CubeParams | CylinderParams;
  position: Position;
  rotation: Position;
}

interface Scene {
  objects: SceneObject[];
}

/**
 * Default 3D scene configuration with basic primitive examples
 */
export const DEFAULT_SCENE: Scene = {
  objects: [
    {
      type: "sphere",
      params: {
        radius: 10
      },
      position: {
        x: 0,
        y: 0,
        z: 0
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      }
    },
    {
      type: "cube",
      params: {
        size: [20, 20, 20]
      },
      position: {
        x: 30,
        y: 0,
        z: 0
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      }
    },
    {
      type: "cylinder",
      params: {
        radius: 8,
        height: 25
      },
      position: {
        x: 60,
        y: 0,
        z: 0
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      }
    }
  ]
}; 