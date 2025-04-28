/**
 * OpenSCAD-compatible assert function
 * Throws an error if the condition is false
 * 
 * @param {boolean} condition - The condition to test
 * @param {string} [message="Assertion failed"] - Optional message to display when assertion fails
 * @returns {boolean|undefined} Returns undefined if used as a statement, true if used in an expression and condition is true
 */
export function assert(condition, message = "Assertion failed") {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  
  // In OpenSCAD, assert() returns the value of the condition expression when used in expressions
  return condition;
}

/**
 * Helper function that can be used to mark dummy variables
 * This exists for OpenSCAD compatibility
 * 
 * @param {any} value - The dummy value
 * @returns {undefined} Always returns undefined
 */
export function dummy_var(value) {
  // In OpenSCAD, dummy = assert(...) is a common pattern
  // This function does nothing, it's just for compatibility
  return undefined;
}
