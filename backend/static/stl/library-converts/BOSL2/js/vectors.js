//////////////////////////////////////////////////////////////////////
// LibFile: vectors.js
//   JavaScript implementation of vector functions from BOSL2.
//   Provides mathematical operations for vector manipulation and searching.
// Includes:
//   import { ... } from './vectors.js'
// FileSummary: Vector arithmetic, angle, and searching
//////////////////////////////////////////////////////////////////////

import { assert, str, echo, is_list, is_num, is_finite, is_undef, is_vector } from '../../../compat/index.js';
import { EPSILON } from './math.js';

// Section: Vector Testing

// We're importing is_vector from compat, but we'll enhance it for more comprehensive vector testing

/**
 * Tests if all elements of a vector are non-zero (greater than epsilon)
 * @param {Array} v - Vector to test
 * @param {number} [eps=EPSILON] - Epsilon value for comparison
 * @returns {boolean} True if all elements are non-zero
 */
export function all_nonzero(v, eps=EPSILON) {
  if (!is_list(v)) return false;
  for (const item of v) {
    if (Math.abs(item) <= eps) return false;
  }
  return true;
}

/**
 * Calculate the norm (magnitude/length) of a vector
 * @param {Array} v - Vector to find the norm of
 * @returns {number} The norm (length) of the vector
 */
export function norm(v) {
  assert(is_vector(v), "Input to norm() must be a vector");
  return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
}

/**
 * Normalizes a vector to unit length
 * @param {Array} v - Vector to normalize
 * @param {number} [length=1] - Length to normalize to
 * @returns {Array} The normalized vector
 */
export function unit(v, length=1) {
  assert(is_vector(v), "Input to unit() must be a vector");
  const n = norm(v);
  if (n < EPSILON) {
    assert(false, "Cannot normalize a zero-length vector");
    return Array(v.length).fill(0); // Fallback that should never be reached
  }
  const factor = length / n;
  return v.map(val => val * factor);
}

/**
 * Scales a vector to specified length
 * @param {Array} v - Vector to scale
 * @param {number} length - Length to scale to
 * @returns {Array} The scaled vector
 */
export function scale(v, length) {
  return unit(v, length);
}

/**
 * Calculates the vector from point a to point b
 * @param {Array} a - First point
 * @param {Array} b - Second point
 * @returns {Array} Vector from a to b
 */
export function vector_from(a, b) {
  assert(is_vector(a) && is_vector(b) && a.length == b.length,
         "Inputs to vector_from() must be vectors of the same length");
  return b.map((val, idx) => val - a[idx]);
}

/**
 * Calculates dot product of two vectors
 * @param {Array} a - First vector
 * @param {Array} b - Second vector
 * @returns {number} Dot product of a and b
 */
export function vdot(a, b) {
  assert(is_vector(a) && is_vector(b) && a.length == b.length,
         "Inputs to vdot() must be vectors of the same length");
  return a.reduce((sum, val, idx) => sum + val * b[idx], 0);
}

/**
 * Calculates cross product of two 3D vectors
 * @param {Array} a - First 3D vector
 * @param {Array} b - Second 3D vector
 * @returns {Array} Cross product vector
 */
export function cross(a, b) {
  assert(is_vector(a) && is_vector(b) && a.length == 3 && b.length == 3,
         "Inputs to cross() must be 3D vectors");
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

/**
 * Calculates the angle between two vectors
 * @param {Array} v1 - First vector
 * @param {Array} v2 - Second vector
 * @returns {number} Angle between vectors in degrees
 */
export function vector_angle(v1, v2) {
  assert(is_vector(v1) && is_vector(v2) && v1.length == v2.length,
         "Inputs to vector_angle() must be vectors of the same length");
  
  const v1Norm = norm(v1);
  const v2Norm = norm(v2);
  
  if (v1Norm < EPSILON || v2Norm < EPSILON) {
    assert(false, "Zero-length vector in vector_angle()");
    return 0;
  }
  
  // Clamp to avoid floating point errors
  const cosine = Math.max(-1, Math.min(1, vdot(v1, v2) / (v1Norm * v2Norm)));
  return Math.acos(cosine) * 180 / Math.PI;
}

/**
 * Calculates the 2D vector pointing in the specified direction
 * @param {number} ang - Angle in degrees
 * @param {number} [r=1] - Length of the vector
 * @returns {Array} 2D vector [x,y]
 */
export function vector2d(ang, r=1) {
  assert(is_num(ang) && is_num(r), "Inputs to vector2d() must be numbers");
  const radians = ang * Math.PI / 180;
  return [r * Math.cos(radians), r * Math.sin(radians)];
}

/**
 * Calculates the 3D vector pointing in the specified direction
 * @param {number} alt - Altitude angle in degrees (from XY plane)
 * @param {number} az - Azimuth angle in degrees (around Z-axis)
 * @param {number} [r=1] - Length of the vector
 * @returns {Array} 3D vector [x,y,z]
 */
export function vector3d(alt, az, r=1) {
  assert(is_num(alt) && is_num(az) && is_num(r), 
         "Inputs to vector3d() must be numbers");
  
  const azRad = az * Math.PI / 180;
  const altRad = alt * Math.PI / 180;
  
  return [
    r * Math.cos(altRad) * Math.cos(azRad),
    r * Math.cos(altRad) * Math.sin(azRad),
    r * Math.sin(altRad)
  ];
}

/**
 * Finds the nearest element in a list of vectors to the given vector
 * @param {Array} v - Vector to find the nearest to
 * @param {Array} list - List of vectors to search
 * @returns {number} Index of the nearest vector in the list
 */
export function nearest_point(v, list) {
  assert(is_vector(v) && is_list(list) && list.length > 0,
         "Input to nearest_point() must be a vector and a non-empty list");
  
  let minDist = Infinity;
  let minIdx = -1;
  
  for (let i = 0; i < list.length; i++) {
    const pt = list[i];
    assert(is_vector(pt) && pt.length == v.length,
           `Item ${i} in list is not a vector of the same dimension as v`);
    
    const dist = norm(vector_from(v, pt));
    if (dist < minDist) {
      minDist = dist;
      minIdx = i;
    }
  }
  
  return minIdx;
}

/**
 * Determines if a given point is coplanar with a given list of points
 * @param {Array} point - Point to check
 * @param {Array} pointsList - List of points defining a plane
 * @param {number} [eps=EPSILON] - Tolerance for coplanarity
 * @returns {boolean} True if the point is coplanar with the given points
 */
export function is_coplanar(point, pointsList, eps=EPSILON) {
  assert(is_vector(point) && point.length >= 3, 
         "The point must be a 3D or higher-dimensional vector");
  assert(is_list(pointsList) && pointsList.length >= 3,
         "The points list must contain at least 3 points");
  
  // Need at least 3 points to define a plane
  if (pointsList.length < 3) return true;
  
  // Create two vectors on the plane
  const v1 = vector_from(pointsList[0], pointsList[1]);
  const v2 = vector_from(pointsList[0], pointsList[2]);
  
  // Create normal vector to the plane
  const normal = cross(v1, v2);
  
  // If normal is zero length, all points are collinear
  if (norm(normal) < eps) return true;
  
  // Check if point lies on the plane
  const v = vector_from(pointsList[0], point);
  return Math.abs(vdot(normal, v)) < eps;
}
