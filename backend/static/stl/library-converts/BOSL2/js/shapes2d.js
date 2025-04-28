//////////////////////////////////////////////////////////////////////
// LibFile: shapes2d.js
//   JavaScript implementation of 2D shape functions from BOSL2.
//   Provides functional forms of core shapes that produce paths.
// Includes:
//   import { ... } from './shapes2d.js'
// FileSummary: 2D primitives for squares, circles, polygons, etc.
//////////////////////////////////////////////////////////////////////

import { assert, str, is_list, is_num, is_undef } from '../../../compat/index.js';
import { sin, cos } from './trigonometry.js';
import { EPSILON, lerp } from './math.js';
import { CENTER, LEFT, RIGHT, FRONT, BACK, BOTTOM, TOP } from './constants.js';
import { vector2d } from './vectors.js';

// Section: 2D Primitives

/**
 * Creates a 2D path for a square or rectangle
 * @param {number|Array} size - The size of the square; if scalar, both X and Y are the same
 * @param {boolean} [center] - If true, centers the square at the origin
 * @param {Array} [anchor=CENTER] - Where to anchor the shape
 * @param {number} [spin=0] - Rotate this many degrees around the Z axis after anchor
 * @returns {Array} Path points for the square
 */
export function square(size, center, anchor=CENTER, spin=0) {
  const _center = !is_undef(center) ? center : false;
  let s = is_num(size) ? [size, size] : size;
  assert(is_list(s) && s.length >= 2, "Size must be a number or a 2+ element array");
  s = s.slice(0, 2);
  
  const anchors = {
    "CENTER": [0, 0],
    "FRONT": [0, -s[1]/2],
    "BACK": [0, s[1]/2],
    "LEFT": [-s[0]/2, 0],
    "RIGHT": [s[0]/2, 0],
    "BOTTOM": [0, -s[1]/2],  // Same as FRONT for 2D
    "TOP": [0, s[1]/2],      // Same as BACK for 2D
    "FRONT+LEFT": [-s[0]/2, -s[1]/2],
    "FRONT+RIGHT": [s[0]/2, -s[1]/2],
    "BACK+LEFT": [-s[0]/2, s[1]/2],
    "BACK+RIGHT": [s[0]/2, s[1]/2]
  };
  
  const default_anchor = _center ? anchors.CENTER : anchors["FRONT+LEFT"];
  const anchor_pos = is_list(anchor) ? anchor : (anchors[anchor] || default_anchor);
  
  // First create a centered square
  let path = [
    [-s[0]/2, -s[1]/2],
    [s[0]/2, -s[1]/2],
    [s[0]/2, s[1]/2],
    [-s[0]/2, s[1]/2]
  ];
  
  // Apply anchor
  path = path.map(p => [
    p[0] - anchor_pos[0], 
    p[1] - anchor_pos[1]
  ]);
  
  // Apply spin if needed
  if (spin !== 0) {
    const a = spin * Math.PI / 180;
    const sa = Math.sin(a);
    const ca = Math.cos(a);
    path = path.map(p => [
      p[0] * ca - p[1] * sa,
      p[0] * sa + p[1] * ca
    ]);
  }
  
  return path;
}

/**
 * Creates a 2D path for a rectangle
 * (Alias for square but exists for consistency with OpenSCAD)
 */
export const rect = square;

/**
 * Creates a 2D path for a circle
 * @param {number} r - Radius of the circle
 * @param {number} [d] - Diameter of the circle (use instead of r)
 * @param {number} [n=36] - Number of points to create the circle
 * @param {Array} [anchor=CENTER] - Where to anchor the shape
 * @param {number} [spin=0] - Rotate this many degrees around the Z axis after anchor
 * @returns {Array} Path points for the circle
 */
export function circle(r, d, n=36, anchor=CENTER, spin=0) {
  const _r = !is_undef(d) ? d/2 : r;
  assert(is_num(_r) && _r >= 0, "Radius/diameter must be a non-negative number");
  assert(is_num(n) && n >= 3, "Number of points must be at least 3");
  
  const anchors = {
    "CENTER": [0, 0],
    "FRONT": [0, -_r],
    "BACK": [0, _r],
    "LEFT": [-_r, 0],
    "RIGHT": [_r, 0],
    "BOTTOM": [0, -_r],  // Same as FRONT for 2D
    "TOP": [0, _r]       // Same as BACK for 2D
  };
  
  const anchor_pos = is_list(anchor) ? anchor : (anchors[anchor] || anchors.CENTER);
  
  // Create circle points
  let path = [];
  const step = 360 / n;
  for (let i = 0; i < n; i++) {
    const a = i * step + spin;
    path.push([
      _r * cos(a) - anchor_pos[0],
      _r * sin(a) - anchor_pos[1]
    ]);
  }
  
  return path;
}

/**
 * Creates a 2D path for a regular polygon
 * @param {number} n - Number of sides
 * @param {number} r - Radius of the circle the polygon is inscribed in
 * @param {number} [d] - Diameter of the circle (use instead of r)
 * @param {number} [rounding=0] - Radius of rounding for the corners
 * @param {Array} [anchor=CENTER] - Where to anchor the shape
 * @param {number} [spin=0] - Rotate this many degrees around the Z axis after anchor
 * @returns {Array} Path points for the polygon
 */
export function regular_ngon(n, r, d, rounding=0, anchor=CENTER, spin=0) {
  const _r = !is_undef(d) ? d/2 : r;
  assert(is_num(_r) && _r >= 0, "Radius/diameter must be a non-negative number");
  assert(is_num(n) && n >= 3, "Number of sides must be at least 3");
  assert(is_num(rounding) && rounding >= 0, "Rounding radius must be non-negative");
  
  const anchors = {
    "CENTER": [0, 0],
    "FRONT": [0, -_r],
    "BACK": [0, _r],
    "LEFT": [-_r, 0],
    "RIGHT": [_r, 0],
    "BOTTOM": [0, -_r],  // Same as FRONT for 2D
    "TOP": [0, _r]       // Same as BACK for 2D
  };
  
  const anchor_pos = is_list(anchor) ? anchor : (anchors[anchor] || anchors.CENTER);
  
  // First calculate the corners of the regular polygon
  let corners = [];
  const step = 360 / n;
  for (let i = 0; i < n; i++) {
    const a = i * step + spin;
    corners.push([
      _r * cos(a),
      _r * sin(a)
    ]);
  }
  
  // If no rounding, return the corners
  if (rounding <= EPSILON) {
    return corners.map(p => [
      p[0] - anchor_pos[0],
      p[1] - anchor_pos[1]
    ]);
  }
  
  // With rounding, we need to calculate tangent points
  let path = [];
  const actual_rounding = Math.min(rounding, _r * Math.sin(Math.PI / n));
  
  for (let i = 0; i < n; i++) {
    const p1 = corners[i];
    const p0 = corners[(i+n-1) % n];
    const p2 = corners[(i+1) % n];
    
    // Calculate unit vectors for the sides
    const v1 = [p0[0] - p1[0], p0[1] - p1[1]];
    const v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const len1 = Math.sqrt(v1[0]*v1[0] + v1[1]*v1[1]);
    const len2 = Math.sqrt(v2[0]*v2[0] + v2[1]*v2[1]);
    
    const u1 = [v1[0] / len1, v1[1] / len1];
    const u2 = [v2[0] / len2, v2[1] / len2];
    
    // Calculate tangent points
    const t1 = [
      p1[0] + u1[0] * actual_rounding,
      p1[1] + u1[1] * actual_rounding
    ];
    const t2 = [
      p1[0] + u2[0] * actual_rounding,
      p1[1] + u2[1] * actual_rounding
    ];
    
    // Add the first tangent point
    path.push([
      t1[0] - anchor_pos[0],
      t1[1] - anchor_pos[1]
    ]);
    
    // Add arc points
    const start_angle = Math.atan2(t1[1] - p1[1], t1[0] - p1[0]) * 180 / Math.PI;
    const end_angle = Math.atan2(t2[1] - p1[1], t2[0] - p1[0]) * 180 / Math.PI;
    
    // Ensure we're going the right way around
    let angle_span = end_angle - start_angle;
    if (angle_span < 0) angle_span += 360;
    if (angle_span > 180) angle_span -= 360;
    
    // Determine number of steps for the arc
    const steps = Math.max(2, Math.ceil(Math.abs(angle_span) / 10));
    
    for (let j = 1; j < steps; j++) {
      const a = start_angle + (angle_span * j / steps);
      const pt = [
        p1[0] + actual_rounding * cos(a) - anchor_pos[0],
        p1[1] + actual_rounding * sin(a) - anchor_pos[1]
      ];
      path.push(pt);
    }
    
    // Add the second tangent point
    path.push([
      t2[0] - anchor_pos[0],
      t2[1] - anchor_pos[1]
    ]);
  }
  
  return path;
}

/**
 * Creates a 2D path for a teardrop shape
 * @param {number} r - Radius of the circular part
 * @param {number} [d] - Diameter of the circular part (use instead of r)
 * @param {number} [angle=45] - Angle in degrees of the sharp end
 * @param {Array} [anchor=CENTER] - Where to anchor the shape
 * @param {number} [spin=0] - Rotate this many degrees around the Z axis after anchor
 * @returns {Array} Path points for the teardrop
 */
export function teardrop2d(r, d, angle=45, anchor=CENTER, spin=0) {
  const _r = !is_undef(d) ? d/2 : r;
  assert(is_num(_r) && _r >= 0, "Radius/diameter must be a non-negative number");
  assert(angle > 0 && angle < 180, "Angle must be between 0 and 180 degrees");
  
  const anchors = {
    "CENTER": [0, 0],
    "FRONT": [0, -_r],
    "BACK": [0, _r],
    "LEFT": [-_r, 0],
    "RIGHT": [_r, 0],
    "BOTTOM": [0, -_r],  // Same as FRONT for 2D
    "TOP": [0, _r]       // Same as BACK for 2D
  };
  
  const anchor_pos = is_list(anchor) ? anchor : (anchors[anchor] || anchors.CENTER);
  
  // Calculate the point of the teardrop
  const half_angle = angle / 2;
  const ang_adj = 90 - half_angle;
  const point_y = _r * Math.tan(ang_adj * Math.PI / 180);
  
  // Create the teardrop path
  let path = [];
  
  // Calculate circular part
  const n = Math.ceil(180 / 5); // One point every 5 degrees
  const start_angle = -half_angle;
  const end_angle = half_angle;
  
  for (let i = 0; i <= n; i++) {
    const a = start_angle + (end_angle - start_angle) * i / n;
    path.push([
      _r * cos(a),
      -_r * sin(a)
    ]);
  }
  
  // Add the point
  path.push([0, point_y]);
  
  // Apply anchor and spin
  path = path.map(p => [
    p[0] - anchor_pos[0],
    p[1] - anchor_pos[1]
  ]);
  
  if (spin !== 0) {
    const a = spin * Math.PI / 180;
    const sa = Math.sin(a);
    const ca = Math.cos(a);
    path = path.map(p => [
      p[0] * ca - p[1] * sa,
      p[0] * sa + p[1] * ca
    ]);
  }
  
  return path;
}

/**
 * Creates a 2D path for an ellipse
 * @param {number} r1 - Radius along the X axis
 * @param {number} r2 - Radius along the Y axis
 * @param {number} [n=36] - Number of points to create the ellipse
 * @param {Array} [anchor=CENTER] - Where to anchor the shape
 * @param {number} [spin=0] - Rotate this many degrees around the Z axis after anchor
 * @returns {Array} Path points for the ellipse
 */
export function ellipse(r1, r2, n=36, anchor=CENTER, spin=0) {
  assert(is_num(r1) && r1 >= 0, "X radius must be a non-negative number");
  assert(is_num(r2) && r2 >= 0, "Y radius must be a non-negative number");
  assert(is_num(n) && n >= 3, "Number of points must be at least 3");
  
  const anchors = {
    "CENTER": [0, 0],
    "FRONT": [0, -r2],
    "BACK": [0, r2],
    "LEFT": [-r1, 0],
    "RIGHT": [r1, 0],
    "BOTTOM": [0, -r2],  // Same as FRONT for 2D
    "TOP": [0, r2]       // Same as BACK for 2D
  };
  
  const anchor_pos = is_list(anchor) ? anchor : (anchors[anchor] || anchors.CENTER);
  
  // Create ellipse points
  let path = [];
  const step = 360 / n;
  for (let i = 0; i < n; i++) {
    const a = i * step + spin;
    path.push([
      r1 * cos(a) - anchor_pos[0],
      r2 * sin(a) - anchor_pos[1]
    ]);
  }
  
  return path;
}

/**
 * Creates a 2D path for a star
 * @param {number} n - Number of points
 * @param {number} r1 - Outer radius
 * @param {number} r2 - Inner radius
 * @param {number} [phase=0] - Rotational phase angle
 * @param {Array} [anchor=CENTER] - Where to anchor the shape
 * @param {number} [spin=0] - Rotate this many degrees around the Z axis after anchor
 * @returns {Array} Path points for the star
 */
export function star(n, r1, r2, phase=0, anchor=CENTER, spin=0) {
  assert(is_num(n) && n >= 3, "Number of points must be at least 3");
  assert(is_num(r1) && r1 >= 0, "Outer radius must be a non-negative number");
  assert(is_num(r2) && r2 >= 0 && r2 <= r1, "Inner radius must be between 0 and outer radius");
  
  const anchors = {
    "CENTER": [0, 0],
    "FRONT": [0, -r1],
    "BACK": [0, r1],
    "LEFT": [-r1, 0],
    "RIGHT": [r1, 0],
    "BOTTOM": [0, -r1],  // Same as FRONT for 2D
    "TOP": [0, r1]       // Same as BACK for 2D
  };
  
  const anchor_pos = is_list(anchor) ? anchor : (anchors[anchor] || anchors.CENTER);
  
  // Create star points
  let path = [];
  const step = 360 / n;
  const offset = spin + phase;
  
  for (let i = 0; i < n; i++) {
    // Outer point
    const a1 = i * step + offset;
    path.push([
      r1 * cos(a1) - anchor_pos[0],
      r1 * sin(a1) - anchor_pos[1]
    ]);
    
    // Inner point
    const a2 = (i + 0.5) * step + offset;
    path.push([
      r2 * cos(a2) - anchor_pos[0],
      r2 * sin(a2) - anchor_pos[1]
    ]);
  }
  
  return path;
}
