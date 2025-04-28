//////////////////////////////////////////////////////////////////////
// LibFile: lists.js
//   JavaScript implementation of list manipulation functions from BOSL2.
//   Provides functions for indexing lists, changing list structure, and
//   constructing lists by rearranging or modifying another list.
// Includes:
//   import { ... } from './lists.js'
// FileSummary: List indexing, structure change, and manipulation
//////////////////////////////////////////////////////////////////////

import { assert, is_list, is_num, is_bool, is_string, is_undef, is_object } from '../../../compat/index.js';

// Section: List Query Operations

/**
 * Checks if all elements in a list are of the same type up to a specified depth
 * @param {Array} l - The list to check
 * @param {number} [depth=10] - The lowest level the check is done
 * @returns {boolean} True if list elements are of the same type
 */
export function is_homogeneous(l, depth=10) {
  if (!is_list(l) || l.length === 0) return false;
  
  const l0 = l[0];
  for (let i = 1; i < l.length; i++) {
    if (!_same_type(l[i], l0, depth+1)) return false;
  }
  
  return true;
}

// Alias for is_homogeneous
export const is_homogenous = is_homogeneous;

/**
 * Helper function to check if two values are of the same type
 * @private
 */
function _same_type(a, b, depth) {
  if (depth === 0) return true;
  
  if (is_undef(a) && is_undef(b)) return true;
  if (is_bool(a) && is_bool(b)) return true;
  if (is_num(a) && is_num(b)) return true;
  if (is_string(a) && is_string(b)) return true;
  
  if (is_list(a) && is_list(b)) {
    if (a.length !== b.length) return false;
    if (a.length === 0) return true;
    
    return is_homogeneous([a[0], b[0]], depth-1);
  }
  
  if (is_object(a) && is_object(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!_same_type(a[key], b[key], depth-1)) return false;
    }
    return true;
  }
  
  return false;
}

/**
 * Gets the first item in a list
 * @param {Array} list - The list to get the first item from
 * @returns {*} The first item in the list
 */
export function first(list) {
  assert(is_list(list) && list.length > 0, "Input must be a non-empty list");
  return list[0];
}

/**
 * Gets the last item in a list
 * @param {Array} list - The list to get the last item from
 * @returns {*} The last item in the list
 */
export function last(list) {
  assert(is_list(list) && list.length > 0, "Input must be a non-empty list");
  return list[list.length - 1];
}

/**
 * Select specific items from a list by index
 * @param {Array} list - The list to select from
 * @param {number|Array} indices - Single index or list of indices to select
 * @returns {*|Array} Selected item(s) from the list
 */
export function select(list, indices) {
  assert(is_list(list), "First argument must be a list");
  
  if (is_num(indices)) {
    // Negative indices count from the end
    const idx = indices < 0 ? list.length + indices : indices;
    assert(idx >= 0 && idx < list.length, `Index ${indices} out of bounds for list of length ${list.length}`);
    return list[idx];
  }
  
  assert(is_list(indices), "Second argument must be a number or list");
  return indices.map(idx => {
    const i = idx < 0 ? list.length + idx : idx;
    assert(i >= 0 && i < list.length, `Index ${idx} out of bounds for list of length ${list.length}`);
    return list[i];
  });
}

/**
 * Gets a sublist from a list
 * @param {Array} list - The list to get a sublist from
 * @param {number} [start=0] - The starting index, inclusive
 * @param {number} [end] - The ending index, exclusive. Default is list length.
 * @returns {Array} The sublist
 */
export function sublist(list, start=0, end) {
  assert(is_list(list), "First argument must be a list");
  
  const len = list.length;
  const s = start < 0 ? len + start : start;
  const e = is_undef(end) ? len : (end < 0 ? len + end : end);
  
  assert(s >= 0, "Start index cannot be negative past the beginning of the list");
  return list.slice(s, e);
}

/**
 * Removes an item from a specific position in a list
 * @param {Array} list - The list to remove an item from
 * @param {number} idx - The index of the item to remove
 * @returns {Array} A new list with the item removed
 */
export function remove_item(list, idx) {
  assert(is_list(list), "First argument must be a list");
  assert(is_num(idx), "Second argument must be an index number");
  
  const i = idx < 0 ? list.length + idx : idx;
  assert(i >= 0 && i < list.length, `Index ${idx} out of bounds for list of length ${list.length}`);
  
  return [...list.slice(0, i), ...list.slice(i + 1)];
}

/**
 * Removes duplicate consecutive items from a list
 * @param {Array} list - The list to deduplicate
 * @returns {Array} A new list with consecutive duplicates removed
 */
export function deduplicate(list) {
  if (!is_list(list) || list.length <= 1) return list;
  
  const result = [list[0]];
  for (let i = 1; i < list.length; i++) {
    const a = list[i-1];
    const b = list[i];
    
    // Deep comparison for arrays
    if (is_list(a) && is_list(b)) {
      if (JSON.stringify(a) !== JSON.stringify(b)) {
        result.push(b);
      }
    } else if (a !== b) {
      result.push(b);
    }
  }
  
  return result;
}

/**
 * Removes duplicates from a list
 * @param {Array} list - The list to deduplicate
 * @returns {Array} A new list with duplicates removed
 */
export function unique(list) {
  if (!is_list(list)) return list;
  
  // For primitive items, we can use a Set
  if (!list.some(item => is_list(item) || is_object(item))) {
    return [...new Set(list)];
  }
  
  // For lists containing objects or arrays, we need deep comparison
  const result = [];
  for (const item of list) {
    const isDuplicate = result.some(existing => {
      if (is_list(item) && is_list(existing)) {
        return JSON.stringify(item) === JSON.stringify(existing);
      }
      return item === existing;
    });
    
    if (!isDuplicate) {
      result.push(item);
    }
  }
  
  return result;
}

/**
 * Creates a list of items repeated a specified number of times
 * @param {*} value - The value to repeat
 * @param {number} n - Number of times to repeat
 * @returns {Array} List with value repeated n times
 */
export function repeat(value, n) {
  assert(is_num(n) && n >= 0, "Repeat count must be a non-negative number");
  return Array(n).fill().map(() => 
    // Deep copy for lists/objects to avoid reference issues
    is_list(value) || is_object(value) ? JSON.parse(JSON.stringify(value)) : value
  );
}

/**
 * Creates a list of indices counting from 0 to len-1
 * @param {Array|number} list_or_length - A list to get the length from, or a length directly
 * @returns {Array} List of indices
 */
export function idx(list_or_length) {
  const len = is_list(list_or_length) ? list_or_length.length : list_or_length;
  assert(is_num(len) && len >= 0, "Length must be a non-negative number");
  return Array(len).fill().map((_, i) => i);
}

/**
 * Reverses a list
 * @param {Array} list - The list to reverse
 * @returns {Array} The reversed list
 */
export function reverse(list) {
  assert(is_list(list), "Input must be a list");
  return [...list].reverse();
}

/**
 * Joins two lists of equal length pair-wise
 * @param {Array} l1 - First list
 * @param {Array} l2 - Second list
 * @returns {Array} List of pairs
 */
export function zip(l1, l2) {
  assert(is_list(l1) && is_list(l2), "Both inputs must be lists");
  assert(l1.length === l2.length, "Lists must have the same length");
  
  return l1.map((item, i) => [item, l2[i]]);
}

/**
 * Sorts a list either numerically or lexicographically
 * @param {Array} list - The list to sort
 * @param {boolean} [idx=false] - If true, returns the sorted indices rather than values
 * @returns {Array} The sorted list or indices
 */
export function sort(list, idx=false) {
  assert(is_list(list), "Input must be a list");
  
  if (idx) {
    const indices = Array(list.length).fill().map((_, i) => i);
    return indices.sort((a, b) => {
      if (is_num(list[a]) && is_num(list[b])) {
        return list[a] - list[b];
      }
      return String(list[a]).localeCompare(String(list[b]));
    });
  }
  
  return [...list].sort((a, b) => {
    if (is_num(a) && is_num(b)) {
      return a - b;
    }
    return String(a).localeCompare(String(b));
  });
}

/**
 * Breaks up a list into sub-lists of the specified size
 * @param {Array} list - The list to chunk
 * @param {number} [size=1] - Size of each chunk
 * @param {boolean} [exact=false] - If true, each chunk must be exactly the specified size
 * @returns {Array} List of chunked sublists
 */
export function chunk(list, size=1, exact=false) {
  assert(is_list(list), "First argument must be a list");
  assert(is_num(size) && size > 0, "Chunk size must be a positive number");
  
  const result = [];
  
  if (exact) {
    for (let i = 0; i <= list.length - size; i += size) {
      result.push(list.slice(i, i + size));
    }
  } else {
    for (let i = 0; i < list.length; i += size) {
      result.push(list.slice(i, i + size));
    }
  }
  
  return result;
}

/**
 * Gets the list of all pairs of adjacent items in a list
 * @param {Array} list - The list to get pairs from
 * @param {boolean} [wrap=false] - If true, wraps around from the end to the start
 * @returns {Array} List of adjacent pairs
 */
export function pair(list, wrap=false) {
  assert(is_list(list), "First argument must be a list");
  
  if (list.length < 2) return [];
  
  const result = [];
  for (let i = 0; i < list.length - 1; i++) {
    result.push([list[i], list[i + 1]]);
  }
  
  if (wrap) {
    result.push([list[list.length - 1], list[0]]);
  }
  
  return result;
}

/**
 * Gets a range of indices inclusively
 * @param {number} start - First index, inclusive
 * @param {number} end - Last index, inclusive
 * @param {number} [step=1] - Step size
 * @returns {Array} List of indices
 */
export function list_range(start, end, step=1) {
  assert(is_num(start) && is_num(end) && is_num(step), 
         "Start, end, and step must be numbers");
  assert(step !== 0, "Step cannot be 0");
  
  const result = [];
  if (step > 0) {
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
  } else {
    for (let i = start; i >= end; i += step) {
      result.push(i);
    }
  }
  
  return result;
}
