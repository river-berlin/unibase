// @ts-nocheck
/**
 * OpenSCAD compatibility function for lookup
 * Searches for the closest value in a table and performs linear interpolation
 * 
 * @param {number} value - The value to look up
 * @param {Array} table - A 2D array where each inner array is [key, value]
 * @returns {number} The interpolated value
 */
export function lookup(value, table) {
  // Sort the table by key (first element of each inner array)
  const sortedTable = [...table].sort((a, b) => a[0] - b[0]);
  
  // If value is less than the smallest key, return the smallest value
  if (value <= sortedTable[0][0]) {
    return sortedTable[0][1];
  }
  
  // If value is greater than the largest key, return the largest value
  if (value >= sortedTable[sortedTable.length - 1][0]) {
    return sortedTable[sortedTable.length - 1][1];
  }
  
  // Find the two closest points for interpolation
  for (let i = 0; i < sortedTable.length - 1; i++) {
    if (value >= sortedTable[i][0] && value <= sortedTable[i + 1][0]) {
      // Linear interpolation
      const key1 = sortedTable[i][0];
      const key2 = sortedTable[i + 1][0];
      const val1 = sortedTable[i][1];
      const val2 = sortedTable[i + 1][1];
      
      // Calculate the interpolation factor
      const factor = (value - key1) / (key2 - key1);
      
      // Return the interpolated value
      return val1 + factor * (val2 - val1);
    }
  }
  
  // Fallback (should not reach here if the function is used correctly)
  return sortedTable[0][1];
}
