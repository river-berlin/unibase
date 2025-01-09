# Sphere

A sphere creates a spherical object centered at its position.

## Parameters

- `radius`: number
  - Radius of the sphere in millimeters
  - Required

## Position and Rotation

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

## Examples

### Basic Sphere
```json
{
  "objects": [{
    "type": "sphere",
    "params": {
      "radius": 10
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
    }
  }]
}
```
Creates a sphere with radius 10mm centered at origin.

### Offset Sphere
```json
{
  "objects": [{
    "type": "sphere",
    "params": {
      "radius": 15
    },
    "position": {
      "x": 20,
      "y": 5,
      "z": -10
    },
    "rotation": {
      "x": 0,
      "y": 0,
      "z": 0
    }
  }]
}
```
Creates a sphere with radius 15mm centered at position [20, 5, -10].

## Notes
- All dimensions are in millimeters
- The sphere is always centered at its position
- Negative values for radius are not allowed
- Position coordinates can be any real number
- The JSON must be wrapped in an `objects` array 