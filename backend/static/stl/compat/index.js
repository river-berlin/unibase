// @ts-nocheck
// Import assert related functions
import { assert, dummy_var } from './assert.js';

// Import string functions
import { str, chr, ord } from './string.js';

// Import type checking functions
import { is_undef, is_bool, is_num, is_string, is_list, is_object, is_vector, is_finite } from './types.js';

// Import echo and concat functions
import { echo } from './echo.js';
import { concat } from './concat.js';

// Export all OpenSCAD-compatible functions
import { lookup } from "./lookup.js";
import { linear_extrude } from "./linear_extrude.js";
import { rotate_extrude } from "./rotate_extrude.js";

export {
  assert,
  dummy_var,
  str,
  chr,
  ord,
  is_undef,
  is_bool,
  is_num,
  is_string,
  is_list,
  is_object,
  is_vector,
  is_finite,
  echo,
  concat,
  lookup,
  linear_extrude,
  rotate_extrude
};
