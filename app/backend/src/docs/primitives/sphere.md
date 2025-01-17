# Sphere

A sphere creates a spherical object centered at its position. See [index](index.md) for common properties and rules.

## Parameters

- `radius`: number
  - Radius of the sphere in millimeters
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