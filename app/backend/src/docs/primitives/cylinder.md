# Cylinder

A cylinder creates a cylindrical object that is always centered at its position.

## Parameters

- `radius`: number
  - Radius of the cylinder
  - Required
- `height`: number
  - Height of the cylinder in millimeters
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

### Basic Cylinder
```json
{
  "objects": [{
    "type": "cylinder",
    "params": {
      "radius": 10,
      "height": 20
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
Creates a cylinder with radius 10mm and height 20mm centered at origin.

### Offset Cylinder
```json
{
  "objects": [{
    "type": "cylinder",
    "params": {
      "radius": 8,
      "height": 25
    },
    "position": {
      "x": 15,
      "y": 0,
      "z": 10
    },
    "rotation": {
      "x": 0,
      "y": 0,
      "z": 0
    }
  }]
}
```
Creates a cylinder with radius 8mm and height 25mm centered at position [15, 0, 10].

## Notes
- All dimensions are in millimeters
- The cylinder is always centered at its position
- Negative values for radius or height are not allowed
- Position coordinates can be any real number
- The JSON must be wrapped in an `objects` array 