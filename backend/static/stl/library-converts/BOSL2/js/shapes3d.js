//////////////////////////////////////////////////////////////////////
// LibFile: shapes3d.js
//   JavaScript implementation of 3D shape functions from BOSL2.
//   Provides functions for creating 3D shapes with attachment capabilities.
// Includes:
//   import { ... } from './shapes3d.js'
// FileSummary: 3D shape primitives like cubes, cylinders, and spheres
//////////////////////////////////////////////////////////////////////

import { assert, str, is_list, is_num, is_undef, is_bool } from '../../../compat/index.js';
import { CENTER, LEFT, RIGHT, FRONT, BACK, BOTTOM, TOP, UP, FWD } from './constants.js';

// Section: Cuboids, Prismoids and Pyramids

/**
 * Creates a 3D cuboid shape
 * @param {number|Array} size - The size of the cube; if scalar, makes a cube with equal sides
 * @param {boolean} [center] - If true, centers the cube at the origin
 * @param {Array} [anchor=CENTER] - Where to anchor the shape
 * @param {number} [spin=0] - Rotate this many degrees around the Z axis after anchor
 * @param {Array} [orient=UP] - Vector to rotate top towards, after spin
 * @returns {Object} The VNF (Vertices 'N' Faces) structure for the cube
 */
export function cube(size, center, anchor=CENTER, spin=0, orient=UP) {
  return cuboid(size, center, anchor, spin, orient);
}

/**
 * Creates a 3D rectangular cuboid shape
 * @param {number|Array} size - The size of the cuboid; if scalar, makes a cube with equal sides
 * @param {boolean} [center] - If true, centers the cuboid at the origin
 * @param {Array} [anchor=CENTER] - Where to anchor the shape
 * @param {number} [spin=0] - Rotate this many degrees around the Z axis after anchor
 * @param {Array} [orient=UP] - Vector to rotate top towards, after spin
 * @returns {Object} The VNF (Vertices 'N' Faces) structure for the cuboid
 */
export function cuboid(size, center, anchor=CENTER, spin=0, orient=UP) {
  const _center = !is_undef(center) ? center : false;
  let s = is_num(size) ? [size, size, size] : size;
  assert(is_list(s) && s.length >= 3, "Size must be a number or a 3+ element array");
  s = s.slice(0, 3);
  
  // Define anchors for 3D shapes
  const anchors = {
    "CENTER": [0, 0, 0],
    "FRONT": [0, -s[1]/2, 0],
    "BACK": [0, s[1]/2, 0],
    "LEFT": [-s[0]/2, 0, 0],
    "RIGHT": [s[0]/2, 0, 0],
    "BOTTOM": [0, 0, -s[2]/2],
    "TOP": [0, 0, s[2]/2],
    "UP": [0, 0, s[2]/2],       // Alias for TOP
    "DOWN": [0, 0, -s[2]/2],    // Alias for BOTTOM
    "FRONT+LEFT": [-s[0]/2, -s[1]/2, 0],
    "FRONT+RIGHT": [s[0]/2, -s[1]/2, 0],
    "BACK+LEFT": [-s[0]/2, s[1]/2, 0],
    "BACK+RIGHT": [s[0]/2, s[1]/2, 0],
    "BOTTOM+FRONT": [0, -s[1]/2, -s[2]/2],
    "BOTTOM+BACK": [0, s[1]/2, -s[2]/2],
    "BOTTOM+LEFT": [-s[0]/2, 0, -s[2]/2],
    "BOTTOM+RIGHT": [s[0]/2, 0, -s[2]/2],
    "BOTTOM+FRONT+LEFT": [-s[0]/2, -s[1]/2, -s[2]/2],
    "BOTTOM+FRONT+RIGHT": [s[0]/2, -s[1]/2, -s[2]/2],
    "BOTTOM+BACK+LEFT": [-s[0]/2, s[1]/2, -s[2]/2],
    "BOTTOM+BACK+RIGHT": [s[0]/2, s[1]/2, -s[2]/2],
    "TOP+FRONT": [0, -s[1]/2, s[2]/2],
    "TOP+BACK": [0, s[1]/2, s[2]/2],
    "TOP+LEFT": [-s[0]/2, 0, s[2]/2],
    "TOP+RIGHT": [s[0]/2, 0, s[2]/2],
    "TOP+FRONT+LEFT": [-s[0]/2, -s[1]/2, s[2]/2],
    "TOP+FRONT+RIGHT": [s[0]/2, -s[1]/2, s[2]/2],
    "TOP+BACK+LEFT": [-s[0]/2, s[1]/2, s[2]/2],
    "TOP+BACK+RIGHT": [s[0]/2, s[1]/2, s[2]/2]
  };
  
  const default_anchor = _center ? anchors.CENTER : anchors["BOTTOM+FRONT+LEFT"];
  const anchor_pos = is_list(anchor) ? anchor : (anchors[anchor] || default_anchor);
  
  // Create a cuboid VNF
  const x = s[0]/2;
  const y = s[1]/2;
  const z = s[2]/2;
  
  // Define vertices
  const vertices = [
    [-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z],  // Bottom face
    [-x, -y, z],  [x, -y, z],  [x, y, z],  [-x, y, z]    // Top face
  ].map(v => [
    v[0] - anchor_pos[0],
    v[1] - anchor_pos[1],
    v[2] - anchor_pos[2]
  ]);
  
  // Define faces (using 0-based indexing)
  const faces = [
    [0, 1, 2, 3],  // Bottom face
    [4, 7, 6, 5],  // Top face
    [0, 4, 5, 1],  // Front face
    [1, 5, 6, 2],  // Right face
    [2, 6, 7, 3],  // Back face
    [3, 7, 4, 0]   // Left face
  ];
  
  // Apply transformations (spin and orient) - placeholders since this would
  // require more complex matrix operations in actual implementation
  
  return { vertices, faces };
}

/**
 * Creates a possibly truncated pyramid or prismoid
 * @param {Array} [size1=[1,1]] - The [x,y] size of the bottom
 * @param {Array} [size2=[1,1]] - The [x,y] size of the top
 * @param {number} h - The height of the prismoid
 * @param {boolean} [shift=[0,0]] - The [x,y] amount to shift the top with respect to the bottom
 * @param {Array} [anchor=BOTTOM] - Where to anchor the shape
 * @param {number} [spin=0] - Rotate this many degrees around the Z axis after anchor
 * @param {Array} [orient=UP] - Vector to rotate top towards, after spin
 * @returns {Object} The VNF structure for the prismoid
 */
export function prismoid(size1=[1,1], size2=[1,1], h=1, shift=[0,0], anchor=BOTTOM, spin=0, orient=UP) {
  assert(is_list(size1) && size1.length >= 2, "size1 must be a 2+ element array");
  assert(is_list(size2) && size2.length >= 2, "size2 must be a 2+ element array");
  assert(is_list(shift) && shift.length >= 2, "shift must be a 2+ element array");
  assert(is_num(h) && h > 0, "height must be a positive number");
  
  // Extract dimensions
  const s1 = size1.slice(0, 2);
  const s2 = size2.slice(0, 2);
  const sh = shift.slice(0, 2);
  
  // Define anchors for 3D shapes - using similar approach as cuboid
  const anchors = {
    "BOTTOM": [0, 0, 0],
    "TOP": [sh[0], sh[1], h],
    "CENTER": [sh[0]/2, sh[1]/2, h/2]
    // Additional anchors would be defined here
  };
  
  const anchor_pos = is_list(anchor) ? anchor : (anchors[anchor] || anchors.BOTTOM);
  
  // Create vertices for the prismoid
  const vertices = [
    // Bottom face vertices
    [-s1[0]/2, -s1[1]/2, 0],
    [ s1[0]/2, -s1[1]/2, 0],
    [ s1[0]/2,  s1[1]/2, 0],
    [-s1[0]/2,  s1[1]/2, 0],
    
    // Top face vertices (shifted)
    [-s2[0]/2 + sh[0], -s2[1]/2 + sh[1], h],
    [ s2[0]/2 + sh[0], -s2[1]/2 + sh[1], h],
    [ s2[0]/2 + sh[0],  s2[1]/2 + sh[1], h],
    [-s2[0]/2 + sh[0],  s2[1]/2 + sh[1], h]
  ].map(v => [
    v[0] - anchor_pos[0],
    v[1] - anchor_pos[1],
    v[2] - anchor_pos[2]
  ]);
  
  // Define faces (using 0-based indexing)
  const faces = [
    [0, 1, 2, 3],  // Bottom face
    [4, 7, 6, 5],  // Top face
    [0, 4, 5, 1],  // Front face
    [1, 5, 6, 2],  // Right face
    [2, 6, 7, 3],  // Back face
    [3, 7, 4, 0]   // Left face
  ];
  
  return { vertices, faces };
}

/**
 * Creates a pyramid
 * @param {Array} [size=[1,1]] - The [x,y] size of the base
 * @param {number} h - The height of the pyramid
 * @param {boolean} [shift=[0,0]] - The [x,y] amount to shift the apex with respect to the center of the base
 * @param {Array} [anchor=BOTTOM] - Where to anchor the shape
 * @param {number} [spin=0] - Rotate this many degrees around the Z axis after anchor
 * @param {Array} [orient=UP] - Vector to rotate top towards, after spin
 * @returns {Object} The VNF structure for the pyramid
 */
export function pyramid(size=[1,1], h=1, shift=[0,0], anchor=BOTTOM, spin=0, orient=UP) {
  assert(is_list(size) && size.length >= 2, "size must be a 2+ element array");
  assert(is_num(h) && h > 0, "height must be a positive number");
  assert(is_list(shift) && shift.length >= 2, "shift must be a 2+ element array");
  
  // This is essentially a prismoid with a point at the top
  return prismoid(
    size,         // Bottom size
    [0, 0],       // Top size (0 = point)
    h,            // Height
    shift,        // Shift
    anchor, spin, orient  // Transformations
  );
}

// Section: Cylindrical Shapes

/**
 * Creates a cylindrical shape
 * @param {number} h - The height of the cylinder
 * @param {number} [r] - The radius of the cylinder
 * @param {number} [d] - The diameter of the cylinder (use instead of r)
 * @param {number} [r1] - The bottom radius of the cylinder
 * @param {number} [r2] - The top radius of the cylinder
 * @param {number} [d1] - The bottom diameter of the cylinder
 * @param {number} [d2] - The top diameter of the cylinder
 * @param {boolean} [center] - If true, centers the cylinder on the origin
 * @param {Array} [anchor=BOTTOM] - Where to anchor the shape
 * @param {number} [spin=0] - Rotate this many degrees around the Z axis after anchor
 * @param {Array} [orient=UP] - Vector to rotate top towards, after spin
 * @param {number} [n=32] - Number of sides to the cylinder
 * @returns {Object} The VNF structure for the cylinder
 */
export function cylinder(h, r, d, r1, r2, d1, d2, center, anchor=BOTTOM, spin=0, orient=UP, n=32) {
  assert(is_num(h) && h > 0, "height must be a positive number");
  assert(n >= 3, "Number of sides (n) must be at least 3");
  
  const _center = !is_undef(center) ? center : false;
  
  // Handle radius/diameter specifications
  let rad1, rad2;
  
  if (!is_undef(r)) {
    // Use r for both radii
    assert(is_num(r) && r >= 0, "Radius must be a non-negative number");
    rad1 = rad2 = r;
  } else if (!is_undef(d)) {
    // Use d for both diameters
    assert(is_num(d) && d >= 0, "Diameter must be a non-negative number");
    rad1 = rad2 = d / 2;
  } else {
    // Use r1,r2 or d1,d2
    if (!is_undef(r1)) {
      assert(is_num(r1) && r1 >= 0, "Bottom radius must be a non-negative number");
      rad1 = r1;
    } else if (!is_undef(d1)) {
      assert(is_num(d1) && d1 >= 0, "Bottom diameter must be a non-negative number");
      rad1 = d1 / 2;
    } else {
      rad1 = 1; // Default radius
    }
    
    if (!is_undef(r2)) {
      assert(is_num(r2) && r2 >= 0, "Top radius must be a non-negative number");
      rad2 = r2;
    } else if (!is_undef(d2)) {
      assert(is_num(d2) && d2 >= 0, "Top diameter must be a non-negative number");
      rad2 = d2 / 2;
    } else {
      rad2 = rad1; // Default to same as bottom radius
    }
  }
  
  // Define anchors for the cylinder
  const anchors = {
    "CENTER": [0, 0, h/2],
    "TOP": [0, 0, h],
    "BOTTOM": [0, 0, 0],
    "CENTER+TOP": [0, 0, h],
    "CENTER+BOTTOM": [0, 0, 0]
  };
  
  const anchor_pos = _center ? [0, 0, 0] : 
                     (is_list(anchor) ? anchor : (anchors[anchor] || anchors.BOTTOM));
  
  // Create vertices for the cylinder
  const vertices = [];
  const faces = [];
  
  // Bottom circle
  for (let i = 0; i < n; i++) {
    const angle = i * 360 / n;
    const x = rad1 * Math.cos(angle * Math.PI / 180);
    const y = rad1 * Math.sin(angle * Math.PI / 180);
    vertices.push([x, y, 0]);
  }
  
  // Top circle
  for (let i = 0; i < n; i++) {
    const angle = i * 360 / n;
    const x = rad2 * Math.cos(angle * Math.PI / 180);
    const y = rad2 * Math.sin(angle * Math.PI / 180);
    vertices.push([x, y, h]);
  }
  
  // Bottom face
  if (rad1 > 0) {
    const bottom_face = [];
    for (let i = n-1; i >= 0; i--) {
      bottom_face.push(i);
    }
    faces.push(bottom_face);
  }
  
  // Top face
  if (rad2 > 0) {
    const top_face = [];
    for (let i = 0; i < n; i++) {
      top_face.push(i + n);
    }
    faces.push(top_face);
  }
  
  // Side faces
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    faces.push([i, next, next + n, i + n]);
  }
  
  // Apply anchor transformation
  const transformed_vertices = vertices.map(v => [
    v[0] - anchor_pos[0],
    v[1] - anchor_pos[1],
    v[2] - anchor_pos[2]
  ]);
  
  return { vertices: transformed_vertices, faces };
}

/**
 * Creates a spherical shape
 * @param {number} [r] - The radius of the sphere
 * @param {number} [d] - The diameter of the sphere (use instead of r)
 * @param {Array} [anchor=CENTER] - Where to anchor the shape
 * @param {number} [spin=0] - Rotate this many degrees around the Z axis after anchor
 * @param {Array} [orient=UP] - Vector to rotate top towards, after spin
 * @param {number} [n=24] - Number of sides to the sphere (longitudinal)
 * @returns {Object} The VNF structure for the sphere
 */
export function sphere(r, d, anchor=CENTER, spin=0, orient=UP, n=24) {
  const rad = !is_undef(d) ? d/2 : (r || 1);
  assert(is_num(rad) && rad > 0, "Radius must be a positive number");
  assert(n >= 3, "Number of sides (n) must be at least 3");
  
  // Define anchors for the sphere
  const anchors = {
    "CENTER": [0, 0, 0]
  };
  
  const anchor_pos = is_list(anchor) ? anchor : (anchors[anchor] || anchors.CENTER);
  
  // Create vertices for the sphere
  const vertices = [];
  const faces = [];
  
  // We'll create a sphere as a series of stacked rings (UV sphere)
  // Number of horizontal rings
  const rings = Math.floor(n / 2);
  
  // Add north pole
  vertices.push([0, 0, rad]);
  
  // Add rings of vertices
  for (let i = 1; i < rings; i++) {
    const phi = i * Math.PI / rings;
    const z = rad * Math.cos(phi);
    const ring_rad = rad * Math.sin(phi);
    
    for (let j = 0; j < n; j++) {
      const theta = j * 2 * Math.PI / n;
      const x = ring_rad * Math.cos(theta);
      const y = ring_rad * Math.sin(theta);
      vertices.push([x, y, z]);
    }
  }
  
  // Add south pole
  vertices.push([0, 0, -rad]);
  
  // Create faces for the top cap
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    faces.push([0, i + 1, next + 1]);
  }
  
  // Create faces for the middle rings
  for (let i = 0; i < rings - 2; i++) {
    const ring_start = 1 + i * n;
    const next_ring_start = ring_start + n;
    
    for (let j = 0; j < n; j++) {
      const next = (j + 1) % n;
      faces.push([
        ring_start + j,
        ring_start + next,
        next_ring_start + next,
        next_ring_start + j
      ]);
    }
  }
  
  // Create faces for the bottom cap
  const last_vert = vertices.length - 1;
  const last_ring_start = last_vert - n;
  
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    faces.push([last_vert, last_ring_start + next, last_ring_start + i]);
  }
  
  // Apply anchor transformation
  const transformed_vertices = vertices.map(v => [
    v[0] - anchor_pos[0],
    v[1] - anchor_pos[1],
    v[2] - anchor_pos[2]
  ]);
  
  return { vertices: transformed_vertices, faces };
}

/**
 * Creates a torus shape
 * @param {number} r_maj - Major radius of the torus
 * @param {number} r_min - Minor radius of the torus
 * @param {Array} [anchor=CENTER] - Where to anchor the shape
 * @param {number} [spin=0] - Rotate this many degrees around the Z axis after anchor
 * @param {Array} [orient=UP] - Vector to rotate top towards, after spin
 * @param {number} [n=16] - Number of sides in the minor circle
 * @param {number} [n_maj=32] - Number of sides in the major circle
 * @returns {Object} The VNF structure for the torus
 */
export function torus(r_maj, r_min, anchor=CENTER, spin=0, orient=UP, n=16, n_maj=32) {
  assert(is_num(r_maj) && r_maj > 0, "Major radius must be a positive number");
  assert(is_num(r_min) && r_min > 0, "Minor radius must be a positive number");
  assert(n >= 3, "Number of sides (n) must be at least 3");
  assert(n_maj >= 3, "Number of major sides (n_maj) must be at least 3");
  
  // Define anchors for the torus
  const anchors = {
    "CENTER": [0, 0, 0]
  };
  
  const anchor_pos = is_list(anchor) ? anchor : (anchors[anchor] || anchors.CENTER);
  
  // Create vertices for the torus
  const vertices = [];
  const faces = [];
  
  // Generate vertices
  for (let i = 0; i < n_maj; i++) {
    const theta = i * 2 * Math.PI / n_maj;
    const center_x = r_maj * Math.cos(theta);
    const center_y = r_maj * Math.sin(theta);
    
    for (let j = 0; j < n; j++) {
      const phi = j * 2 * Math.PI / n;
      const ring_x = r_min * Math.cos(phi);
      const ring_z = r_min * Math.sin(phi);
      
      // The ring is in the XZ plane, rotated around Y axis by theta
      const x = center_x + ring_x * Math.cos(theta);
      const y = center_y + ring_x * Math.sin(theta);
      const z = ring_z;
      
      vertices.push([x, y, z]);
    }
  }
  
  // Generate faces
  for (let i = 0; i < n_maj; i++) {
    const next_i = (i + 1) % n_maj;
    
    for (let j = 0; j < n; j++) {
      const next_j = (j + 1) % n;
      
      // Indices of the four corners of the face
      const idx1 = i * n + j;
      const idx2 = i * n + next_j;
      const idx3 = next_i * n + next_j;
      const idx4 = next_i * n + j;
      
      faces.push([idx1, idx2, idx3, idx4]);
    }
  }
  
  // Apply anchor transformation
  const transformed_vertices = vertices.map(v => [
    v[0] - anchor_pos[0],
    v[1] - anchor_pos[1],
    v[2] - anchor_pos[2]
  ]);
  
  return { vertices: transformed_vertices, faces };
}
