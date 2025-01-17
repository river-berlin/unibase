# 3D Primitives

This documentation describes the basic 3D primitive objects available for creating models. Each primitive is centered at its position and can be combined to create complex shapes.

## Available Primitives

- [Cube](cube.md) - Creates rectangular prisms and cubes
- [Sphere](sphere.md) - Creates spherical objects
- [Cylinder](cylinder.md) - Creates cylindrical objects
- [Polyhedron](polyhedron.md) - Creates custom shapes using vertices and faces

## Object Properties

Each object can be either solid or hollow:
- Solid objects (default) are rendered in blue
- Hollow objects are rendered in semi-transparent white
- Use the `isHollow` property to control this behavior

## Common Properties

### Position and Rotation
All primitives require position and rotation properties:

- `position`: Object
  - `x`: number - X coordinate
  - `y`: number - Y coordinate
  - `z`: number - Z coordinate
  - Required
- `rotation`: Object
  - `x`: number - X rotation in degrees
  - `y`: number - Y rotation in degrees
  - `z`: number - Z rotation in degrees
  - Required

### Common Rules
- All dimensions are in millimeters
- Objects are always centered at their position
- Negative values for sizes, radii, or heights are not allowed
- Position coordinates can be any real number
- The JSON must be wrapped in an `objects` array
- Hollow objects are rendered in semi-transparent white
- Solid objects are rendered in blue

## Scene Properties

The scene itself can be rotated independently of individual objects. This is useful for viewing the model from different angles or setting up a specific orientation for the entire scene.

## JSON Structure

The JSON structure includes both scene properties and an array of objects. Scene rotation is specified in degrees:

```json
{
  "scene": {
    "rotation": {
      "x": 0,  // Rotation around X axis in degrees
      "y": 0,  // Rotation around Y axis in degrees
      "z": 0   // Rotation around Z axis in degrees
    }
  },
  "objects": [
    {
      "type": "primitive_type",
      "params": {
        // parameters specific to the primitive type
      },
      "position": {
        "x": 0,
        "y": 0,
        "z": 0
      },
      "rotation": {
        "x": 0,
        "y": 0,
        "z": 0
      },
      "isHollow": false
    }
  ]
}
```

## Examples

### Basic Scene with Rotation
```json
{
  "scene": {
    "rotation": {
      "x": 45,
      "y": 0,
      "z": 30
    }
  },
  "objects": [
    {
      "type": "cube",
      "params": {
        "size": 20
      },
      "position": {
        "x": 0,
        "y": 0,
        "z": 0
      },
      "rotation": {
        "x": 0,
        "y": 0,
        "z": 0
      },
      "isHollow": false
    }
  ]
}
```
Creates a solid blue cube with side length 20, and rotates the entire scene 45 degrees around the X axis and 30 degrees around the Z axis.

### Multiple Objects with Scene Rotation
```json
{
  "scene": {
    "rotation": {
      "x": 0,
      "y": 90,
      "z": 0
    }
  },
  "objects": [
    {
      "type": "sphere",
      "params": {
        "radius": 15
      },
      "position": {
        "x": 0,
        "y": 0,
        "z": 0
      },
      "rotation": {
        "x": 0,
        "y": 0,
        "z": 0
      },
      "isHollow": true
    },
    {
      "type": "cylinder",
      "params": {
        "radius": 5,
        "height": 30
      },
      "position": {
        "x": 20,
        "y": 0,
        "z": 0
      },
      "rotation": {
        "x": 90,
        "y": 0,
        "z": 0
      },
      "isHollow": false
    }
  ]
}
```
Creates a hollow sphere and a solid cylinder, then rotates the entire scene 90 degrees around the Y axis.

## Notes
- All dimensions are in millimeters
- Objects are always centered at their position
- Negative values for sizes, radii, or heights are not allowed
- Position coordinates can be any real number
- The JSON must be wrapped in an `objects` array
- Hollow objects are rendered in semi-transparent white
- Solid objects are rendered in blue 