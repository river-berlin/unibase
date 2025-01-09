/**
 * Default 3D scene configuration with basic primitive examples
 */
export const DEFAULT_SCENE = {
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