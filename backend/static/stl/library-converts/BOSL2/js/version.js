//////////////////////////////////////////////////////////////////////
// LibFile: version.js
//   JavaScript conversion of BOSL2 version management functions.
// Includes:
//   import { ... } from './version.js'
// FileSummary: Parse and compare semantic versions.
//////////////////////////////////////////////////////////////////////

import { assert, str, chr, ord, is_list, is_string, is_num, is_vector, is_undef, echo, concat } from '../../../compat/index.js';

// Current BOSL version
export const BOSL_VERSION = [2, 0, 716];

// Section: BOSL Library Version Functions

/**
 * Returns the BOSL2 version as a list.
 * @returns {Array<number>} A list with three integer elements, [MAJOR,MINOR,REV]
 */
export function bosl_version() {
  return BOSL_VERSION;
}

/**
 * Returns version as a number [major].[minor].[revision]
 * @returns {number} Version as a floating point number
 */
export function bosl_version_num() {
  return version_to_num(BOSL_VERSION);
}

/**
 * Returns a string of the version, formatted like "MAJOR.MINOR.REV"
 * @returns {string} Formatted version string
 */
export function bosl_version_str() {
  return version_to_str(BOSL_VERSION);
}

/**
 * Asserts that the currently installed BOSL library is at least the given version
 * @param {Array|number|string} version - Version required
 */
export function bosl_required(version) {
  assert(
    version_cmp(bosl_version(), version) >= 0,
    str("BOSL ", bosl_version_str(), " is installed, but BOSL ",
        version_to_str(version), " or better is required.")
  );
}

// Section: Generic Version Functions

/**
 * Helper function to split version string into components
 * Implemented in a recursive manner similar to OpenSCAD version
 * @private
 */
function _version_split_str(x, _i=0, _out=[], _num=0) {
  if (_i >= x.length) {
    return concat(_out, [_num]);
  }
  
  const cval = ord(x[_i]) - ord("0");
  const numend = cval < 0 || cval > 9;
  const new_out = numend ? concat(_out, [_num]) : _out;
  const new_num = numend ? 0 : (10 * _num + cval);
  
  return _version_split_str(x, _i + 1, new_out, new_num);
}

/**
 * Given a version string, number, or list, returns the list of version integers [MAJOR,MINOR,REVISION]
 * @param {Array|number|string} version - Version to convert
 * @returns {Array<number>} Version as a list of integers
 */
export function version_to_list(version) {
  if (is_list(version)) {
    return [
      is_undef(version[0]) ? 0 : version[0],
      is_undef(version[1]) ? 0 : version[1],
      is_undef(version[2]) ? 0 : version[2]
    ];
  } else if (is_string(version)) {
    const parts = _version_split_str(version);
    return [
      is_undef(parts[0]) ? 0 : parts[0],
      is_undef(parts[1]) ? 0 : parts[1],
      is_undef(parts[2]) ? 0 : parts[2]
    ];
  } else if (is_num(version)) {
    return [
      Math.floor(version),
      Math.floor((version * 100) % 100),
      Math.floor((version * 1000000) % 10000 + 0.5)
    ];
  } else {
    assert(is_num(version) || is_vector(version) || is_string(version), "Version must be a number, string, or array");
    return [0, 0, 0]; // Fallback that should never be reached due to assert
  }
}

/**
 * Takes a version string, number, or list, and returns the properly formatted version string
 * @param {Array|number|string} version - Version to convert
 * @returns {string} Formatted version string "MAJOR.MINOR.REV"
 */
export function version_to_str(version) {
  const version_list = version_to_list(version);
  return str(version_list[0], ".", version_list[1], ".", version_list[2]);
}

/**
 * Takes a version string, number, or list, and returns a properly formatted version number
 * Returns a floating point number of the version in the format major.minorrevision
 * @param {Array|string|number} version - Version to convert
 * @returns {number} Version as a floating point number
 */
export function version_to_num(version) {
  const version_list = version_to_list(version);
  return (version_list[0] * 1000000 + version_list[1] * 10000 + version_list[2]) / 1000000;
}

/**
 * Compares two versions and returns their relative value
 * @param {Array|number|string} a - First version to compare
 * @param {Array|number|string} b - Second version to compare
 * @returns {number} <0 if a<b, 0 if a==b, >0 if a>b
 */
export function version_cmp(a, b) {
  const a_ver = version_to_list(a);
  const b_ver = version_to_list(b);
  const cmps = [];
  
  for (let i = 0; i <= 2; i++) {
    if (a_ver[i] != b_ver[i]) {
      cmps.push(a_ver[i] - b_ver[i]);
    }
  }
  
  return cmps.length === 0 ? 0 : cmps[0];
}
