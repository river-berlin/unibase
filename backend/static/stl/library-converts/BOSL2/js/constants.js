//////////////////////////////////////////////////////////////////////
// LibFile: constants.js
//   JavaScript conversion of constants from BOSL2.
//   Provides direction constants and line specifiers.
// Includes:
//   import { ... } from './constants.js'
// FileSummary: Constants provided by the library
//////////////////////////////////////////////////////////////////////

import { str, chr, ord, is_undef, is_list, is_num, assert } from '../../../compat/index.js';

// A value that the user should never enter randomly
export const _UNDEF = "LRG+HX7dy89RyHvDlAKvb9Y04OTuaikpx205CTh8BSI";

// Section: General Constants

/**
 * Returns the slop value for the current context
 * The $slop value is for dealing with printer tolerance issues
 * @returns {number} The slop value (0 if not set)
 */
export function get_slop() {
  // In JavaScript, we'll default to 0 if not set
  return is_undef($slop) ? 0 : $slop;
}

// Section: Vector Constants

// Direction Vectors
export const LEFT   = [-1,  0,  0];
export const RIGHT  = [ 1,  0,  0];
export const FRONT  = [ 0, -1,  0];
export const FWD    = FRONT;
export const FORWARD = FRONT;
export const BACK   = [ 0,  1,  0];
export const BOTTOM = [ 0,  0, -1];
export const BOT    = BOTTOM;
export const DOWN   = BOTTOM;
export const TOP    = [ 0,  0,  1];
export const UP     = TOP;
export const CENTER = [ 0,  0,  0];
export const CTR    = CENTER;
export const CENTRE = CENTER;

/**
 * A shorthand for the named anchors "edge0", "top_edge0", etc.
 * @param {Array|number} a - Direction (TOP, BOT, CTR) or edge index if b is undefined
 * @param {number} [b] - Edge index when a is a direction
 * @returns {string} Edge name string
 */
export function EDGE(a, b) {
  if (is_undef(b)) {
    return str("edge", a);
  }
  
  // Check if direction is valid
  const validDirs = [TOP, BOT, CTR, 1, 0, -1];
  const isValid = is_list(a) 
    ? validDirs.some(d => is_list(d) && d.every((val, idx) => val === a[idx]))
    : validDirs.includes(a);
    
  if (!isValid) {
    assert(false, str("Invalid direction: ", a));
  }
  
  const choices = ["bot_", "", "top_"];
  const ind = is_list(a) ? a[2] : a;
  return str(choices[ind+1], "edge", b);
}

/**
 * A shorthand for the named anchors "face0", "face1", etc.
 * @param {number} i - Face index
 * @returns {string} Face name string
 */
export function FACE(i) {
  return str("face", i);
}

// Section: Line specifiers
// Used for specifying whether two points are treated as an unbounded line,
// a ray with one endpoint, or a segment with two endpoints.

// Treat a line as a segment [true, true]
export const SEGMENT = [true, true];

// Treat a line as a ray, based at the first point [true, false]
export const RAY = [true, false];

// Treat a line as an unbounded line [false, false]
export const LINE = [false, false];
