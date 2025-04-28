/**
 * OpenSCAD-compatible concat function
 */

/**
 * Concatenates two or more arrays or values
 * Equivalent to OpenSCAD's concat() function
 * 
 * @param {...any} args - Arrays or values to concatenate
 * @returns {Array} The concatenated result
 */
export function concat(...args) {
  let result = [];
  
  for (const arg of args) {
    if (Array.isArray(arg)) {
      result = result.concat(arg);
    } else {
      result.push(arg);
    }
  }
  
  return result;
}
