# Cube

A cube creates a rectangular prism that is always centered at its position. See [index](index.md) for common properties and rules.

## Parameters

- `size`: Array[number] or number
  - If array: `[width, depth, height]`
  - If number: creates a cube with equal dimensions
  - Required

## Examples

### Basic Cube
```json
{
  "objects": [{
    "type": "cube",
    "params": {
      "size": 10
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
Creates a 10x10x10 cube centered at origin.

### Rectangular Prism
```json
{
  "objects": [{
    "type": "cube",
    "params": {
      "size": [20, 10, 5]
    },
    "position": {
      "x": 5,
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
Creates a rectangular prism with width=20, depth=10, height=5, centered at position [5, 0, 10]. 