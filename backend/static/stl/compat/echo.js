/**
 * OpenSCAD-compatible echo function
 */

/**
 * Echo values to the console for debugging purposes
 * Equivalent to OpenSCAD's echo() function
 * 
 * @param {...any} args - Values to output to console
 * @returns {Array} The input arguments (to allow for echo chaining like in OpenSCAD)
 */
export function echo(...args) {
  // Format similar to OpenSCAD's echo output
  const formattedArgs = args.map(arg => {
    if (Array.isArray(arg)) {
      return `[${arg.join(', ')}]`;
    } else if (typeof arg === 'string') {
      return `"${arg}"`;
    } else {
      return String(arg);
    }
  }).join(', ');
  
  console.log(`ECHO: ${formattedArgs}`);
  
  // OpenSCAD's echo returns its arguments for chaining
  return args;
}
