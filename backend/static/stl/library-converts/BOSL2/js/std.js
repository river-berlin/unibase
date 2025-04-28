//////////////////////////////////////////////////////////////////////
// LibFile: std.js
//   JavaScript conversion of BOSL2 standard library imports
// Includes:
//   import { ... } from './std.js'
//////////////////////////////////////////////////////////////////////

import { assert } from 'basics';

// Version check - we'll use something similar for JavaScript
const BOSL2_REQUIRED_VERSION = 20190500;
assert(true, "Version check handled differently in JavaScript");

// Import only the sub-modules that exist
import * as version from './version.js';
import * as constants from './constants.js';
import * as transforms from './transforms.js';
import * as attachments from './attachments.js';
import * as shapes3d from './shapes3d.js';
import * as shapes2d from './shapes2d.js';
import * as math from './math.js';
import * as paths from './paths.js';
import * as lists from './lists.js';
import * as trigonometry from './trigonometry.js';
import * as vectors from './vectors.js';
import * as matrices from './matrices.js';
import * as rounding from './rounding.js';
import * as gears from './gears.js';

// Re-export everything
export {
  version,
  constants,
  transforms,
  attachments,
  shapes3d,
  shapes2d,
  math,
  paths,
  lists,
  trigonometry,
  vectors,
  matrices,
  rounding,
  gears
};

// Export individual functions from each module

// Constants
export { _UNDEF, LEFT, RIGHT, FRONT, FWD, FORWARD, BACK, BOTTOM, BOT, DOWN, TOP, UP, CENTER, CTR, CENTRE, EDGE, FACE, SEGMENT, RAY, LINE } from './constants.js';

// Math functions
export { PHI, EPSILON, INF, NAN, count, lerp, lerpn, quant, constrain, min_element, max_element, sum, mean, product } from './math.js';

// Version functions
export { BOSL_VERSION, bosl_version, bosl_version_num, bosl_version_str, bosl_required, version_to_list, version_to_str, version_to_num, version_cmp } from './version.js';

// Vector functions
export { all_nonzero, norm, unit, scale, vector_from, vdot, cross, vector_angle, vector2d, vector3d, nearest_point, is_coplanar } from './vectors.js';

// List functions
export { is_homogeneous, is_homogenous, first, last, select, sublist, remove_item, deduplicate, unique, repeat, idx, reverse, zip, sort, chunk, pair, list_range } from './lists.js';

// Trigonometry functions
export { rad2deg, deg2rad, law_of_cosines, law_of_sines, sin, cos, tan, asin, acos, atan, atan2, csc, sec, cot } from './trigonometry.js';

// 2D Shape functions
export { square, rect, circle, regular_ngon, teardrop2d, ellipse, star } from './shapes2d.js';

// 3D Shape functions
export { cube, cuboid, prismoid, pyramid, cylinder, sphere, torus } from './shapes3d.js';

// Path functions
export { is_path, is_closed_path, path_length, path_segment_length, deduplicate_path, path_resample, 
         path_position, path_nearest_point, path_cut, subdivide_path, point_in_polygon, 
         path_tangent, path_normal, path_equal_segments } from './paths.js';

// Matrix functions
export { is_matrix, is_matrix_symmetric, ident, matrix_transpose, submatrix, column, matrix_mul, determinant, matrix_inverse, matrix_copy, back_substitute, is_rotation } from './matrices.js';

// Rounding functions
export { round_corners, fillet_path, fillet_path_mask } from './rounding.js';

// Gear functions
export { pitch_radius, outer_radius, root_radius, base_radius, circular_pitch, diametral_pitch, module_value,
         gear_tooth_profile, spur_gear2d, spur_gear, gear_rack2d, gear_rack, bevel_gear2d, bevel_gear,
         worm2d, worm, worm_gear, gear_dist } from './gears.js';
