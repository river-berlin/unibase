# Polyhedron

A polyhedron creates a custom 3D shape defined by its vertices and faces. The shape will be centered at its position.

## Parameters

- `points`: Array[Array[number]]
  - List of [x, y, z] coordinates defining the vertices relative to the center
  - Required
  - Each point is an array of 3 numbers
- `faces`: Array[Array[number]]
  - List of faces, each defined by indices into the points array
  - Required
  - Each face is an array of 3 or more indices
  - Faces must be specified in counter-clockwise order when viewed from outside

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

### Triangle-based Pyramid
```json
{
  "objects": [{
    "type": "polyhedron",
    "params": {
      "points": [
        [-5, -5, -5],  // base point 0
        [5, -5, -5],   // base point 1
        [0, 5, -5],    // base point 2
        [0, 0, 5]      // apex point 3
      ],
      "faces": [
        [0, 1, 2],    // base
        [0, 2, 3],    // side 1
        [1, 3, 2],    // side 2
        [0, 3, 1]     // side 3
      ]
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
Creates a centered pyramid with a triangular base.

### Offset Box
```json
{
  "objects": [{
    "type": "polyhedron",
    "params": {
      "points": [
        [-5, -5, -5], [5, -5, -5], [5, 5, -5], [-5, 5, -5],  // bottom face
        [-5, -5, 5], [5, -5, 5], [5, 5, 5], [-5, 5, 5]       // top face
      ],
      "faces": [
        [0, 1, 2, 3],  // bottom
        [4, 5, 6, 7],  // top
        [0, 4, 7, 3],  // left
        [1, 5, 6, 2],  // right
        [0, 1, 5, 4],  // front
        [3, 2, 6, 7]   // back
      ]
    },
    "position": {
      "x": 10,
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
Creates a 10x10x10 box centered at position [10, 0, 10].

## Notes
- All dimensions are in millimeters
- Points are specified relative to the center before the position is applied
- All points must be part of at least one face
- Faces must be planar (all points in the same plane)
- Faces must be specified in counter-clockwise order when viewed from outside
- The shape must be manifold (watertight)
- Each edge should be shared by exactly two faces
- Position coordinates can be any real number
- The JSON must be wrapped in an `objects` array 