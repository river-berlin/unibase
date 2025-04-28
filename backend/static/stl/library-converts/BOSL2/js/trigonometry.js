//////////////////////////////////////////////////////////////////////
// LibFile: trigonometry.js
//   JavaScript implementation of trigonometry functions from BOSL2.
//   Provides trigonometry shortcuts and various angle calculation functions.
// Includes:
//   import { ... } from './trigonometry.js'
// FileSummary: Trigonometry shortcuts and angle calculations
//////////////////////////////////////////////////////////////////////

import { assert, is_list, is_num, is_undef } from '../../../compat/index.js';
import { EPSILON, constrain } from './math.js';

// Section: Angular Conversion Functions

/**
 * Convert radians to degrees
 * @param {number|Array} rad - Angle in radians
 * @returns {number|Array} Angle in degrees
 */
export function rad2deg(rad) {
  if (is_list(rad)) {
    return rad.map(a => a * 180 / Math.PI);
  }
  return rad * 180 / Math.PI;
}

/**
 * Convert degrees to radians
 * @param {number|Array} deg - Angle in degrees
 * @returns {number|Array} Angle in radians
 */
export function deg2rad(deg) {
  if (is_list(deg)) {
    return deg.map(a => a * Math.PI / 180);
  }
  return deg * Math.PI / 180;
}

// Section: 2D General Triangle Functions

/**
 * Applies the Law of Cosines for an arbitrary triangle
 * @param {number} a - Length of the first side
 * @param {number} b - Length of the second side
 * @param {number} [c] - Length of the third side
 * @param {number} [C] - Angle in degrees of the corner opposite of the third side
 * @returns {number} The third side length or angle depending on inputs
 */
export function law_of_cosines(a, b, c, C) {
  assert(
    (is_undef(c) && !is_undef(C)) || (!is_undef(c) && is_undef(C)),
    "Must give exactly one of c= or C="
  );
  
  if (is_undef(c)) {
    // Using the Law of Cosines to find the third side
    // c^2 = a^2 + b^2 - 2*a*b*cos(C)
    const C_rad = C * Math.PI / 180;
    return Math.sqrt(a*a + b*b - 2*a*b*Math.cos(C_rad));
  } else {
    // Using the Law of Cosines to find the angle
    // cos(C) = (a^2 + b^2 - c^2) / (2*a*b)
    return Math.acos(
      constrain((a*a + b*b - c*c) / (2*a*b), -1, 1)
    ) * 180 / Math.PI;
  }
}

/**
 * Applies the Law of Sines for an arbitrary triangle
 * @param {number} [a] - Length of the first side
 * @param {number} [A] - Angle in degrees of the corner opposite of the first side
 * @param {number} [b] - Length of the second side
 * @param {number} [B] - Angle in degrees of the corner opposite of the second side
 * @returns {number} The missing side length or angle
 */
export function law_of_sines(a, A, b, B) {
  const defined_count = [a,A,b,B].filter(x => !is_undef(x)).length;
  assert(defined_count == 3, "Must give exactly 3 of the 4 arguments.");
  
  if (is_undef(a)) {
    // Find the missing side a
    const A_rad = A * Math.PI / 180;
    const B_rad = B * Math.PI / 180;
    return b * Math.sin(A_rad) / Math.sin(B_rad);
  } else if (is_undef(A)) {
    // Find the missing angle A
    const B_rad = B * Math.PI / 180;
    return Math.asin(constrain(a * Math.sin(B_rad) / b, -1, 1)) * 180 / Math.PI;
  } else if (is_undef(b)) {
    // Find the missing side b
    const A_rad = A * Math.PI / 180;
    const B_rad = B * Math.PI / 180;
    return a * Math.sin(B_rad) / Math.sin(A_rad);
  } else { // is_undef(B)
    // Find the missing angle B
    const A_rad = A * Math.PI / 180;
    return Math.asin(constrain(b * Math.sin(A_rad) / a, -1, 1)) * 180 / Math.PI;
  }
}

// Section: Trig Functions

/**
 * Returns the cosecant of the angle, 1/sin(angle)
 * @param {number} x - Angle in degrees
 * @returns {number} The cosecant of the angle
 */
export function csc(x) {
  const xr = x * Math.PI / 180;
  const sinx = Math.sin(xr);
  assert(Math.abs(sinx) > EPSILON, "csc() of 0 is undefined");
  return 1 / sinx;
}

/**
 * Returns the secant of the angle, 1/cos(angle)
 * @param {number} x - Angle in degrees
 * @returns {number} The secant of the angle
 */
export function sec(x) {
  const xr = x * Math.PI / 180;
  const cosx = Math.cos(xr);
  assert(Math.abs(cosx) > EPSILON, "sec() of 90° or 270° is undefined");
  return 1 / cosx;
}

/**
 * Returns the cotangent of the angle, 1/tan(angle)
 * @param {number} x - Angle in degrees
 * @returns {number} The cotangent of the angle
 */
export function cot(x) {
  const xr = x * Math.PI / 180;
  const tanx = Math.tan(xr);
  assert(Math.abs(tanx) > EPSILON, "cot() of 0 or 180° is undefined");
  return 1 / tanx;
}

/**
 * Returns the sine of the angle in degrees
 * @param {number} x - Angle in degrees
 * @returns {number} The sine of the angle
 */
export function sin(x) {
  return Math.sin(x * Math.PI / 180);
}

/**
 * Returns the cosine of the angle in degrees
 * @param {number} x - Angle in degrees
 * @returns {number} The cosine of the angle
 */
export function cos(x) {
  return Math.cos(x * Math.PI / 180);
}

/**
 * Returns the tangent of the angle in degrees
 * @param {number} x - Angle in degrees
 * @returns {number} The tangent of the angle
 */
export function tan(x) {
  return Math.tan(x * Math.PI / 180);
}

/**
 * Returns the arc sine (inverse sine) in degrees
 * @param {number} x - Value to get the arc sine of
 * @returns {number} The angle in degrees
 */
export function asin(x) {
  assert(x >= -1 && x <= 1, "asin() requires -1 <= x <= 1");
  return Math.asin(x) * 180 / Math.PI;
}

/**
 * Returns the arc cosine (inverse cosine) in degrees
 * @param {number} x - Value to get the arc cosine of
 * @returns {number} The angle in degrees
 */
export function acos(x) {
  assert(x >= -1 && x <= 1, "acos() requires -1 <= x <= 1");
  return Math.acos(x) * 180 / Math.PI;
}

/**
 * Returns the arc tangent (inverse tangent) in degrees
 * @param {number} x - Value to get the arc tangent of
 * @returns {number} The angle in degrees
 */
export function atan(x) {
  return Math.atan(x) * 180 / Math.PI;
}

/**
 * Returns the 2-argument arc tangent in degrees
 * @param {number} y - Y coordinate
 * @param {number} x - X coordinate
 * @returns {number} The angle in degrees in range [-180, 180]
 */
export function atan2(y, x) {
  return Math.atan2(y, x) * 180 / Math.PI;
}
