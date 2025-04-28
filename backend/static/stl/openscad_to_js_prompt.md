# OpenSCAD to JavaScript Conversion Guide

This guide explains how to convert OpenSCAD code to JavaScript using our compatibility layer. This allows you to take existing OpenSCAD models and port them to our JavaScript-based 3D modeling framework.

## Basic Requirements

- Each JavaScript file must export a single object called `object` which contains your final 3D model
- All operations should use named parameters in a single options object
- All measurements are in the same units as your OpenSCAD model (typically millimeters)

## Available Functions

You can import these functions from the basics.js module:

```javascript
import { 
  // Basic shapes
  cube, cuboid, sphere, cylinder, cone, polygon, polyhedron,
  
  // Boolean operations
  union, subtract, intersect,
  
  // Extrusion functions
  linear_extrude, rotate_extrude,
  
  // OpenSCAD compatibility
  lookup,
  assert,
  dummy_var,
  
  // Advanced shapes
  screwThread, augerThread
} from './basics.js';
```

## Shape Functions

Each shape function now takes a single options object with named parameters:

### Cuboid / Cube

```javascript
// OpenSCAD:
// cube([width, height, depth], center);

// JavaScript:
const myCube = cuboid({
  width: 10,
  height: 20,
  depth: 30,
  center: true,
  color: 0xff0000,  // Optional: Red color
  position: { x: 0, y: 0, z: 0 },  // Optional
  rotation: { x: 0, y: 0, z: 0 }   // Optional: in radians
});
```

### Sphere

```javascript
// OpenSCAD:
// sphere(r=10);
// sphere(d=20);

// JavaScript:
const mySphere = sphere({
  radius: 10,  // or diameter: 20
  segments: 32,  // Optional: resolution
  color: 0x00ff00,  // Optional: Green color
  position: { x: 0, y: 0, z: 0 }  // Optional
});
```

### Cylinder

```javascript
// OpenSCAD:
// cylinder(h=10, r=5, center=false);
// cylinder(h=10, r1=5, r2=3, center=false);

// JavaScript:
const myCylinder = cylinder({
  height: 10,
  radius: 5,  // or diameter: 10
  radiusTop: 3,  // Optional: for cone-like shapes
  radiusBottom: 5,  // Optional: for cone-like shapes
  segments: 32,  // Optional: resolution
  center: false,  // Optional: default is false
  color: 0x0000ff,  // Optional: Blue color
  position: { x: 0, y: 0, z: 0 }  // Optional
});
```

### Cone

```javascript
// OpenSCAD:
// cylinder(h=10, r1=5, r2=0, center=false);

// JavaScript:
const myCone = cone({
  height: 10,
  radiusBottom: 5,  // or diameterBottom: 10
  center: false,  // Optional: default is false
  segments: 32,  // Optional: resolution
  color: 0xffff00,  // Optional: Yellow color
  position: { x: 0, y: 0, z: 0 }  // Optional
});
```

### Polygon

```javascript
// OpenSCAD:
// polygon(points=[[0,0],[10,0],[5,10]], paths=[[0,1,2]]);

// JavaScript:
const myPolygon = polygon({
  points: [[0, 0], [10, 0], [5, 10]],  // Array of [x,y] coordinates
  paths: [[0, 1, 2]],  // Points indices to connect
  color: 0xff00ff  // Optional: purple color
});
```

### Polyhedron

```javascript
// OpenSCAD:
// polyhedron(
//   points = [[0,0,0], [10,0,0], [0,10,0], [0,0,10]],
//   faces = [[0,1,2], [0,2,3], [0,3,1], [1,3,2]]
// );

// JavaScript:
const myPolyhedron = polyhedron({
  points: [
    [0, 0, 0],  // Vertex 0
    [10, 0, 0], // Vertex 1
    [0, 10, 0], // Vertex 2
    [0, 0, 10]  // Vertex 3
  ],  // Array of [x,y,z] coordinates (matches OpenSCAD format)
  faces: [[0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 3, 2]],  // Vertices to connect for each face
  color: 0x00ffff  // Optional: cyan color
});
```

## Extrusion Functions

### Linear Extrude

```javascript
// OpenSCAD:
// linear_extrude(height=10, twist=0, scale=1.0) polygon(...);

// JavaScript:
const extrudedShape = linear_extrude({
  height: 10,
  twist: 0,  // Optional: degrees of twist along height
  scale: 1.0,  // Optional: scale factor at the top
  center: false,  // Optional: center along z-axis
  slices: 10,  // Optional: number of intermediate points
  shape: myPolygonShape,  // A polygon object with points and paths
  color: 0xffa500,  // Optional: orange color
  position: { x: 0, y: 0, z: 0 }  // Optional
});
```

### Rotate Extrude

```javascript
// OpenSCAD:
// rotate_extrude(angle=360) polygon(...);

// JavaScript:
const rotatedShape = rotate_extrude({
  angle: 360,  // Optional: degrees of revolution
  segments: 32,  // Optional: resolution of the revolution
  shape: polygon(...),  // A polygon object with points and paths
  color: 0x800080,  // Optional: purple color
  position: { x: 0, y: 0, z: 0 }  // Optional
});
```

## Boolean Operations

### Union

```javascript
// OpenSCAD:
// union() {
//   cube([10, 10, 10]);
//   translate([5, 5, 5]) sphere(r=5);
// }

// JavaScript:
const combinedShape = union({
  objects: [
    cuboid({ width: 10, height: 10, depth: 10 }),
    sphere({ 
      radius: 5,
      position: { x: 5, y: 5, z: 5 }
    })
  ],
  color: 0x808080  // Optional: gray color
});
```

### Subtract

```javascript
// OpenSCAD:
// difference() {
//   cube([10, 10, 10], center=true);
//   sphere(r=6);
// }

// JavaScript:
const subtractedShape = difference({
  baseObject: cuboid({ width: 10, height: 10, depth: 10, center: true }),
  objectsToSubtract: [
    sphere({ radius: 6 })
  ],
  color: 0xff5733  // Optional: custom color
});
```

### Intersect

```javascript
// OpenSCAD:
// intersection() {
//   cube([10, 10, 10], center=true);
//   sphere(r=6);
// }

// JavaScript:
const intersectedShape = intersect({
  objects: [
    cuboid({ width: 10, height: 10, depth: 10, center: true }),
    sphere({ radius: 6 })
  ],
  color: 0x33ff57  // Optional: custom color
});
```

## Other OpenSCAD Features

### Lookup Function

```javascript
// OpenSCAD:
// lookup(value, [[0, 1], [1, 3], [2, 5]]);

// JavaScript:
const interpolatedValue = lookup({
  value: 0.5,
  table: [[0, 1], [1, 3], [2, 5]]
});
```

## Exporting Your Model

There are three ways to export your model from your JavaScript file. You can choose one of the following approaches:

### Option 1: Export a Single Object

Export a single 3D object called `object`:

```javascript
// The final object that will be exported/rendered
const object = union({
  objects: [
    myCube,
    sphere({ radius: 5, position: { x: 15, y: 0, z: 0 } }),
    cylinder({ height: 10, radius: 5, position: { x: 0, y: 15, z: 0 } })
  ]
});

// Export the final object
export { object };
```

### Option 2: Export Multiple Objects

Export an array of objects called `objects` (each will be exported as a separate STL file):

```javascript
// Create multiple objects to export
const objects = [
  cuboid({ width: 10, height: 10, depth: 10, position: { x: -20, y: 0, z: 0 } }),
  sphere({ radius: 8, position: { x: 0, y: 0, z: 0 } }),
  cylinder({ height: 15, radius: 5, position: { x: 20, y: 0, z: 0 } })
];

// Export the array of objects
export { objects };
```

## Example: Converting an OpenSCAD Model

### OpenSCAD Original:
```openscad
difference() {
  union() {
    cube([20, 20, 10], center=true);
    translate([0, 0, 5]) cylinder(h=10, r=5);
  }
  translate([0, 0, -5]) rotate([0, 0, 0]) cylinder(h=30, r=2);
}
```

### JavaScript Conversion:
```javascript
import { cuboid, cylinder, union, difference } from './basics.js';

// Direct 1:1 translation of the OpenSCAD code
const object = difference(
  union(
    cuboid({
      width: 20,
      height: 20,
      depth: 10,
      center: true
    }),
    cylinder({
      height: 10,
      radius: 5,
      position: { x: 0, y: 0, z: 5 }
    })
  ),
  cylinder({
    height: 30,
    radius: 2,
    position: { x: 0, y: 0, z: -5 }
  })
);

// Export the final object
export { object };
```

## Best Practices

1. Use named parameters instead of positional arguments
2. Keep your code organized with meaningful variable names
3. Use the position property instead of separate translate operations when possible
4. For complex models, break them down into smaller, reusable components
5. Remember that rotations in JavaScript are in radians, not degrees

## Common Gotchas

1. OpenSCAD uses degrees for rotations, while our library uses radians
2. The coordinate system is the same, but the way transformations are applied might differ
3. Remember to export using one of the three export methods: `object`, `objects`, or `generateStls`
