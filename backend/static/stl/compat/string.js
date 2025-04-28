/**
 * OpenSCAD-compatible string manipulation functions
 */

/**
 * Converts values to strings and concatenates them
 * Equivalent to OpenSCAD's str() function
 * 
 * @param {...any} args - Values to concatenate
 * @returns {string} The concatenated string
 */
export function str(...args) {
  return args.map(arg => String(arg)).join('');
}

/**
 * Returns the character for a given Unicode value
 * Equivalent to OpenSCAD's chr() function
 * 
 * @param {number} code - Unicode value of character
 * @returns {string} The character corresponding to the code
 */
export function chr(code) {
  return String.fromCharCode(code);
}

/**
 * Returns the Unicode value of the first character in a string
 * Equivalent to OpenSCAD's ord() function
 * 
 * @param {string} str - String to get Unicode value from
 * @returns {number} The Unicode value of the first character
 */
export function ord(str) {
  if (!str || str.length === 0) return 0;
  return str.charCodeAt(0);
}
