/**
 * OpenSCAD-compatible type checking functions
 * These functions provide equivalent behavior to OpenSCAD's built-in type checks
 */

/**
 * Check if a value is undefined
 * @param {any} v - Value to check
 * @returns {boolean} True if the value is undefined
 */
export function is_undef(v) {
  return v === undefined || v === null;
}

/**
 * Check if a value is a boolean
 * @param {any} v - Value to check
 * @returns {boolean} True if the value is a boolean
 */
export function is_bool(v) {
  return typeof v === 'boolean';
}

/**
 * Check if a value is a number
 * @param {any} v - Value to check
 * @returns {boolean} True if the value is a number and not NaN
 */
export function is_num(v) {
  return typeof v === 'number' && !isNaN(v);
}

/**
 * Check if a value is a string
 * @param {any} v - Value to check
 * @returns {boolean} True if the value is a string
 */
export function is_string(v) {
  return typeof v === 'string';
}

/**
 * Check if a value is an array (OpenSCAD's is_list)
 * @param {any} v - Value to check
 * @returns {boolean} True if the value is an array
 */
export function is_list(v) {
  return Array.isArray(v);
}

/**
 * Check if a value is an object (excluding arrays)
 * @param {any} v - Value to check
 * @returns {boolean} True if the value is an object but not an array
 */
export function is_object(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Check if a value is a vector (array of numbers)
 * @param {any} v - Value to check
 * @returns {boolean} True if the value is an array of numbers
 */
export function is_vector(v) {
  if (!Array.isArray(v)) return false;
  return v.every(item => typeof item === 'number' && !isNaN(item));
}

/**
 * Check if a value is finite
 * @param {any} v - Value to check
 * @returns {boolean} True if the value is a finite number
 */
export function is_finite(v) {
  return typeof v === 'number' && isFinite(v);
}