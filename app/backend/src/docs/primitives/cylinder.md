# Cylinder

A cylinder creates a cylindrical object that is always centered at its position. See [index](index.md) for common properties and rules.

## Parameters

- `radius`: number
  - Radius of the cylinder
  - Required
- `height`: number
  - Height of the cylinder in millimeters
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