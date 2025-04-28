//////////////////////////////////////////////////////////////////////
// LibFile: transforms.js
//   JavaScript conversion of BOSL2 transform functions
//   Provides shortcuts for translation, rotation and mirror operations.
// Includes:
//   import { ... } from './transforms.js'
// FileSummary: Shortcuts for translation, rotation, etc.
//////////////////////////////////////////////////////////////////////

import { str, chr, ord, is_undef, is_list, is_num, assert } from '../../../compat/index.js';

// The special NO_ARG value
export const _NO_ARG = [true, [123232345], false];

//////////////////////////////////////////////////////////////////////
// Section: Translations
//////////////////////////////////////////////////////////////////////

/**
 * Move an object in an arbitrary direction
 * @param {Array|string} v - Vector to move by or string like "centroid", "mean", "box"
 * @param {Array|Object} [p] - Points, VNF or other geometry to operate on
 * @returns {Array|Object|Function} - A transformation matrix, transformed points, or a function
 */
export function move(v, p) {
  if (is_undef(p)) {
    // Return a transformation matrix
    if (is_string(v)) {
      assert(false, str("Invalid vector: ", v));
      return [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ];
    }
    assert(is_list(v) && v.length >= 1 && v.length <= 3, "Vector must be a list of 1-3 elements");
    
    const x = v[0] || 0;
    const y = v.length > 1 ? v[1] : 0;
    const z = v.length > 2 ? v[2] : 0;
    
    return [
      [1, 0, 0, x],
      [0, 1, 0, y],
      [0, 0, 1, z],
      [0, 0, 0, 1]
    ];
  } else {
    // Apply the transformation to p
    // Implementation would depend on what p is (points, VNF, etc.)
    // This would need THREE.js implementation specific to your application
    return p; // Placeholder
  }
}

// Alias for move
export const translate = move;

/**
 * Move right by specified amount.
 * @param {number} x - Distance to move right
 * @param {Array|Object} [p] - Points, VNF or other geometry to operate on
 * @returns {Array|Object|Function} - A transformation matrix, transformed points, or a function
 */
export function right(x=0, p) {
  return move([x, 0, 0], p);
}

/**
 * Move left by specified amount.
 * @param {number} x - Distance to move left
 * @param {Array|Object} [p] - Points, VNF or other geometry to operate on
 * @returns {Array|Object|Function} - A transformation matrix, transformed points, or a function
 */
export function left(x=0, p) {
  return move([-x, 0, 0], p);
}

/**
 * Move forward by specified amount.
 * @param {number} y - Distance to move forward
 * @param {Array|Object} [p] - Points, VNF or other geometry to operate on
 * @returns {Array|Object|Function} - A transformation matrix, transformed points, or a function
 */
export function fwd(y=0, p) {
  return move([0, -y, 0], p);
}

// Aliases for fwd
export const forward = fwd;
export const front = fwd;

/**
 * Move backward by specified amount.
 * @param {number} y - Distance to move backward
 * @param {Array|Object} [p] - Points, VNF or other geometry to operate on
 * @returns {Array|Object|Function} - A transformation matrix, transformed points, or a function
 */
export function back(y=0, p) {
  return move([0, y, 0], p);
}

/**
 * Move upward by specified amount.
 * @param {number} z - Distance to move up
 * @param {Array|Object} [p] - Points, VNF or other geometry to operate on
 * @returns {Array|Object|Function} - A transformation matrix, transformed points, or a function
 */
export function up(z=0, p) {
  return move([0, 0, z], p);
}

/**
 * Move downward by specified amount.
 * @param {number} z - Distance to move down
 * @param {Array|Object} [p] - Points, VNF or other geometry to operate on
 * @returns {Array|Object|Function} - A transformation matrix, transformed points, or a function
 */
export function down(z=0, p) {
  return move([0, 0, -z], p);
}

//////////////////////////////////////////////////////////////////////
// Section: Rotations
//////////////////////////////////////////////////////////////////////

/**
 * Generic rotation function
 * @param {Array|number} a - Rotation angle(s) or axis vector
 * @param {Array|Object} [p] - Points, VNF or other geometry to operate on
 * @param {Array} [cp] - Centerpoint of rotation
 * @returns {Array|Object|Function} - A transformation matrix, transformed points, or a function
 */
export function rot(a, p, cp) {
  // Implementation would depend on THREE.js for matrix operations
  if (is_undef(p)) {
    // Return a transformation matrix
    return [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]; // Placeholder
  } else {
    // Apply the transformation to p
    return p; // Placeholder
  }
}

/**
 * Rotate around X axis by specified angle.
 * @param {number} a - Angle in degrees to rotate around X axis
 * @param {Array|Object} [p] - Points, VNF or other geometry to operate on
 * @param {Array} [cp] - Centerpoint of rotation
 * @returns {Array|Object|Function} - A transformation matrix, transformed points, or a function
 */
export function xrot(a=0, p, cp) {
  return rot([a, 0, 0], p, cp);
}

/**
 * Rotate around Y axis by specified angle.
 * @param {number} a - Angle in degrees to rotate around Y axis
 * @param {Array|Object} [p] - Points, VNF or other geometry to operate on
 * @param {Array} [cp] - Centerpoint of rotation
 * @returns {Array|Object|Function} - A transformation matrix, transformed points, or a function
 */
export function yrot(a=0, p, cp) {
  return rot([0, a, 0], p, cp);
}

/**
 * Rotate around Z axis by specified angle.
 * @param {number} a - Angle in degrees to rotate around Z axis
 * @param {Array|Object} [p] - Points, VNF or other geometry to operate on
 * @param {Array} [cp] - Centerpoint of rotation
 * @returns {Array|Object|Function} - A transformation matrix, transformed points, or a function
 */
export function zrot(a=0, p, cp) {
  return rot([0, 0, a], p, cp);
}
