//////////////////////////////////////////////////////////////////////
// LibFile: math.js
//   JavaScript implementation of math functions from BOSL2.
//   Provides math constants, interpolation, list operations, and utility functions.
// Includes:
//   import { ... } from './math.js'
// FileSummary: Math constants, interpolation, list operations, and utility functions
//////////////////////////////////////////////////////////////////////

import { assert, str, echo, is_list, is_num, is_finite, is_undef, is_vector, concat } from '../../../compat/index.js';

// Section: Math Constants

// The golden ratio φ (phi)
export const PHI = (1 + Math.sqrt(5)) / 2;

// A really small value useful in comparing floating point numbers
export const EPSILON = 1e-9;

// The value for Infinite, useful for comparisons
export const INF = Infinity;

// The value for Not a Number, useful for comparisons
export const NAN = NaN;

// Section: Interpolation and Counting

/**
 * Creates a list of `n` numbers, starting at `s`, incrementing by `step` each time
 * @param {number|Array} n - The length of the list to create, or a list to match the length of
 * @param {number} [s=0] - The starting value of the list
 * @param {number} [step=1] - The amount to increment successive numbers in the list
 * @param {boolean} [reverse=false] - Reverse the list
 * @returns {Array<number>} List of incrementing numbers
 */
export function count(n, s=0, step=1, reverse=false) {
  const length = is_list(n) ? n.length : n;
  const result = [];
  
  if (reverse) {
    for (let i = length - 1; i >= 0; i--) {
      result.push(s + i * step);
    }
  } else {
    for (let i = 0; i < length; i++) {
      result.push(s + i * step);
    }
  }
  
  return result;
}

/**
 * Helper function to check if two values have the same shape (for lerp)
 * @private
 */
function same_shape(a, b) {
  if (!is_list(a) || !is_list(b)) {
    return (!is_list(a) && !is_list(b)) || (is_list(a) && a.length === 0) || (is_list(b) && b.length === 0);
  }
  if (a.length != b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!same_shape(a[i], b[i])) return false;
  }
  return true;
}

/**
 * Helper function to check if value is a valid range
 * @private
 */
function valid_range(r) {
  return is_list(r) && r.length >= 2 && r.length <= 3 && 
         is_finite(r[0]) && is_finite(r[1]) && (r.length < 3 || is_finite(r[2]));
}

/**
 * Interpolate between two values or vectors
 * @param {number|Array} a - First value or vector
 * @param {number|Array} b - Second value or vector
 * @param {number|Array} u - The proportion from `a` to `b` to calculate (standard range 0.0 to 1.0)
 * @returns {number|Array} Interpolated value(s)
 */
export function lerp(a, b, u) {
  assert(same_shape(a, b), "Bad or inconsistent inputs to lerp");
  
  if (is_finite(u)) {
    return (1 - u) * a + u * b;
  }
  
  assert(is_finite(u) || is_vector(u) || valid_range(u), 
         "Input u to lerp must be a number, vector, or valid range.");
  
  if (valid_range(u)) {
    // Handle range format [start:step:end] or [start:end]
    const start = u[0];
    const end = u.length === 3 ? u[2] : u[1];
    const step = u.length === 3 ? u[1] : 1;
    
    const result = [];
    for (let v = start; (step > 0) ? (v <= end) : (v >= end); v += step) {
      result.push((1 - v) * a + v * b);
    }
    return result;
  }
  
  // Handle list of values
  return u.map(v => (1 - v) * a + v * b);
}

/**
 * Returns exactly `n` values, linearly interpolated between `a` and `b`
 * @param {number|Array} a - First value or vector
 * @param {number|Array} b - Second value or vector
 * @param {number} n - Number of evenly spaced values to return
 * @param {boolean} [endpoint=true] - If true, include the endpoint `b`
 * @returns {Array} List of interpolated values
 */
export function lerpn(a, b, n, endpoint=true) {
  assert(is_num(n) && n >= 1, "Input n to lerpn must be a positive number.");
  
  if (n === 1) {
    return [a];
  }
  
  const result = [];
  const div = endpoint ? n - 1 : n;
  
  for (let i = 0; i < n; i++) {
    const u = i / div;
    result.push(lerp(a, b, u));
  }
  
  return result;
}

/**
 * Quantize a value or values to a specific step size
 * @param {number|Array} v - The value or list of values to quantize
 * @param {number} [step=1] - The step size to quantize to
 * @param {number} [offset=0] - The base to quantize from. Default: 0
 * @returns {number|Array} Quantized value or list of values
 */
export function quant(v, step=1, offset=0) {
  if (is_list(v)) {
    return v.map(x => quant(x, step, offset));
  }
  return step * Math.round((v - offset) / step) + offset;
}

/**
 * Take a number and constrain it to a specified range
 * @param {number|Array} v - Value to constrain
 * @param {number} [minval=-INF] - Minimum value to return
 * @param {number} [maxval=INF] - Maximum value to return
 * @returns {number|Array} Value constrained to the range
 */
export function constrain(v, minval=-INF, maxval=INF) {
  if (is_list(v)) {
    return v.map(x => constrain(x, minval, maxval));
  }
  return Math.min(Math.max(v, minval), maxval);
}

/**
 * Find the minimum value in a list
 * @param {Array} list - List to get minimum value from
 * @returns {number} Minimum value in the list
 */
export function min_element(list) {
  assert(is_list(list) && list.length > 0, "Input must be a non-empty list");
  return Math.min(...list);
}

/**
 * Find the maximum value in a list
 * @param {Array} list - List to get maximum value from
 * @returns {number} Maximum value in the list
 */
export function max_element(list) {
  assert(is_list(list) && list.length > 0, "Input must be a non-empty list");
  return Math.max(...list);
}

/**
 * Calculate the sum of all items in a list
 * @param {Array} list - List to sum
 * @param {number} [dflt=0] - Default value to return for empty lists
 * @returns {number|Array} Sum of all items in the list
 */
export function sum(list, dflt=0) {
  if (!is_list(list) || list.length === 0) return dflt;
  
  if (is_list(list[0])) {
    // Sum lists of vectors
    const result = Array(list[0].length).fill(0);
    for (const item of list) {
      for (let i = 0; i < item.length; i++) {
        result[i] += item[i];
      }
    }
    return result;
  }
  
  // Sum list of numbers
  return list.reduce((acc, val) => acc + val, 0);
}

/**
 * Calculate the mean of all items in a list
 * @param {Array} list - List to average
 * @param {number|Array} [dflt=0] - Default value to return for empty lists
 * @returns {number|Array} Average value of items in the list
 */
export function mean(list, dflt=0) {
  if (!is_list(list) || list.length === 0) return dflt;
  return sum(list) / list.length;
}

/**
 * Calculate the product of all items in a list
 * @param {Array} list - List of values to multiply
 * @param {number} [dflt=1] - Default value to return for empty lists
 * @returns {number} Product of all items in the list
 */
export function product(list, dflt=1) {
  if (!is_list(list) || list.length === 0) return dflt;
  return list.reduce((acc, val) => acc * val, 1);
}
