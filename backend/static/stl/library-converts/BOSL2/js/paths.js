//////////////////////////////////////////////////////////////////////
// LibFile: paths.js
//   JavaScript implementation of path functions from BOSL2.
//   Provides functions for manipulation of paths, which are lists of points
//   that can be connected into line segments or polygons.
// Includes:
//   import { ... } from './paths.js'
// FileSummary: Path manipulation, sampling, and measurement
//////////////////////////////////////////////////////////////////////

import { assert, str, is_list, is_num, is_undef, is_vector, is_bool, echo } from '../../../compat/index.js';
import { EPSILON, lerp, quant } from './math.js';
import { norm, unit, vector_from } from './vectors.js';

// Section: Utility Functions

/**
 * Returns true if list is a valid path
 * @param {Array} list - List to check
 * @param {number|Array} [dim] - Allowed dimensions for path points
 * @param {boolean} [fast=false] - Set to true for faster check that only examines the first entry
 * @returns {boolean} True if the list is a valid path
 */
export function is_path(list, dim, fast=false) {
  const allowed_dims = is_list(dim) ? dim : 
                       is_num(dim) ? [dim] : 
                       is_undef(dim) ? [2, 3] : 
                       null;
  
  if (!is_list(list) || list.length < 2) return false;

  // Check first point
  if (!is_vector(list[0])) return false;
  const first_len = list[0].length;
  
  // Fast mode only checks the first entry
  if (fast) return true;
  
  // All entries must be vectors of the same dimension
  for (let i = 1; i < list.length; i++) {
    if (!is_vector(list[i]) || list[i].length !== first_len) {
      return false;
    }
  }
  
  // Check dimensions if specified
  if (allowed_dims !== null && !allowed_dims.includes(first_len)) {
    return false;
  }
  
  return true;
}

/**
 * Returns true if list is a closed path or a 1-region
 * @param {Array} path - Path to check
 * @returns {boolean} True if the path is closed
 */
export function is_closed_path(path) {
  if (!is_path(path)) {
    // Check for 1-region (a region with exactly one path)
    if (is_list(path) && path.length === 1 && is_path(path[0])) {
      return true;
    }
    return false;
  }
  
  // Path is closed if the first and last points are the same
  const first = path[0];
  const last = path[path.length - 1];
  
  if (first.length !== last.length) return false;
  
  for (let i = 0; i < first.length; i++) {
    if (Math.abs(first[i] - last[i]) > EPSILON) {
      return false;
    }
  }
  
  return true;
}

/**
 * Returns the length of a path
 * @param {Array} path - The path to find the length of
 * @param {boolean} [closed=false] - If true, return the length of the path with the end connected to the start
 * @returns {number} The length of the path
 */
export function path_length(path, closed=false) {
  assert(is_path(path), "Input must be a path");
  
  let length = 0;
  for (let i = 1; i < path.length; i++) {
    length += norm(vector_from(path[i-1], path[i]));
  }
  
  // If closed, add distance from last point back to first
  if (closed && path.length > 1) {
    length += norm(vector_from(path[path.length-1], path[0]));
  }
  
  return length;
}

/**
 * Returns the length of a path up to a specific segment
 * @param {Array} path - The path to find the length of
 * @param {number} n - How many segments to include in the length calculation
 * @param {boolean} [closed=false] - If true, treat the path as a closed polygon
 * @returns {number} The length of the first n segments of the path
 */
export function path_segment_length(path, n, closed=false) {
  assert(is_path(path), "First argument must be a path");
  assert(is_num(n) && n >= 0, "Second argument must be a non-negative number");
  
  if (n === 0) return 0;
  
  const num_segments = closed ? path.length : path.length - 1;
  assert(n <= num_segments, `Segment index ${n} exceeds the number of segments ${num_segments}`);
  
  let length = 0;
  for (let i = 1; i <= n; i++) {
    const idx1 = i - 1;
    const idx2 = i % path.length;
    length += norm(vector_from(path[idx1], path[idx2]));
  }
  
  return length;
}

/**
 * Returns a path or list of paths with 2d or 3d points repeated
 * when the distance to the next point is below EPSILON
 * @param {Array} list - The path or list of paths to process
 * @returns {Array} The processed path or list of paths
 */
export function deduplicate_path(list) {
  if (!is_list(list)) return list;
  
  if (is_path(list)) {
    const result = [list[0]];
    for (let i = 1; i < list.length; i++) {
      const dist = norm(vector_from(list[i-1], list[i]));
      if (dist > EPSILON) {
        result.push(list[i]);
      }
    }
    return result;
  }
  
  // If it's a list of paths
  return list.map(path => deduplicate_path(path));
}

/**
 * Samples the input path at specified intervals based on distance
 * @param {Array} path - The path to sample
 * @param {number} [spacing] - The distance increment for sampling, overrides counts
 * @param {number} [n] - Number of samples, default is paths length
 * @param {boolean} [closed=false] - If true, treat the path as a closed polygon
 * @returns {Array} The resampled path
 */
export function path_resample(path, spacing, n, closed=false) {
  assert(is_path(path), "First argument must be a path");
  assert(path.length >= 2, "Path must have at least 2 points");
  
  if (path.length <= 2 && (!closed || path.length < 2)) {
    return [...path];
  }
  
  // If neither spacing nor n is given, return the original path
  if (is_undef(spacing) && is_undef(n)) {
    return [...path];
  }
  
  const plen = path_length(path, closed);
  
  if (plen < EPSILON) {
    // Path is too short, just return start or end points
    return path.length > 0 ? [path[0]] : [];
  }
  
  const segments = closed ? path.length : path.length - 1;
  
  // Determine the number of samples
  const num_samples = !is_undef(spacing) ? Math.floor(plen / spacing) + 1 :
                     !is_undef(n) ? n : path.length;
  
  assert(num_samples > 0, "Number of samples must be positive");
  
  // Special case for n=2
  if (num_samples === 2) {
    return [path[0], path[path.length - 1]];
  }
  
  // Calculate the step size
  const step = plen / (num_samples - (closed ? 0 : 1));
  
  // Prepare to sample
  const result = [];
  let consumed = 0;
  let segment_idx = 0;
  let segment_start = path[0];
  let segment_end = path[1 % path.length];
  let segment_vec = vector_from(segment_start, segment_end);
  let segment_len = norm(segment_vec);
  
  for (let i = 0; i < num_samples; i++) {
    const target_dist = i * step;
    
    // Find the segment containing this distance
    while (consumed + segment_len < target_dist && segment_idx < segments - 1) {
      consumed += segment_len;
      segment_idx += 1;
      segment_start = path[segment_idx];
      segment_end = path[(segment_idx + 1) % path.length];
      segment_vec = vector_from(segment_start, segment_end);
      segment_len = norm(segment_vec);
    }
    
    // Calculate the point on the current segment
    if (segment_len < EPSILON) {
      result.push([...segment_start]);
    } else {
      const segment_frac = (target_dist - consumed) / segment_len;
      const point = segment_start.map((val, i) => val + segment_frac * segment_vec[i]);
      result.push(point);
    }
  }
  
  return result;
}

/**
 * Returns the polygon segment index and relative distance for a point at a given path length
 * @param {Array} path - The path to find the position on
 * @param {number} dist - The distance along the path to find the position
 * @param {boolean} [closed=false] - If true, treat the path as a closed polygon
 * @returns {Array} [Segment index, Distance along segment]
 */
export function path_position(path, dist, closed=false) {
  assert(is_path(path), "First argument must be a path");
  assert(is_num(dist) && dist >= 0, "Second argument must be a non-negative distance");
  
  const segments = closed ? path.length : path.length - 1;
  if (segments < 1 || dist <= 0) {
    return [0, 0];
  }
  
  let consumed = 0;
  for (let i = 0; i < segments; i++) {
    const this_pt = path[i];
    const next_pt = path[(i + 1) % path.length];
    const segment_vec = vector_from(this_pt, next_pt);
    const segment_len = norm(segment_vec);
    
    if (consumed + segment_len >= dist) {
      // We found the segment containing the target distance
      return [i, dist - consumed];
    }
    
    consumed += segment_len;
  }
  
  // If we get here, the requested distance is beyond the path length
  return [segments - 1, path_length(path, closed) - consumed];
}

/**
 * Finds the nearest point to a given point on a path
 * @param {Array} path - The path to find the nearest point on
 * @param {Array} pt - The point to find the closest path point to
 * @param {boolean} [closed=false] - If true, treat the path as a closed polygon
 * @returns {Array} [Point on path, Distance along the path, Segment index]
 */
export function path_nearest_point(path, pt, closed=false) {
  assert(is_path(path), "First argument must be a path");
  assert(is_vector(pt), "Second argument must be a point");
  
  if (path.length < 2) {
    return path.length > 0 ? [path[0], 0, 0] : null;
  }
  
  const segments = closed ? path.length : path.length - 1;
  let min_dist_sq = Infinity;
  let min_point = null;
  let min_dist_along = 0;
  let min_segment = 0;
  
  let dist_along = 0;
  
  for (let i = 0; i < segments; i++) {
    const p1 = path[i];
    const p2 = path[(i + 1) % path.length];
    const segment_vec = vector_from(p1, p2);
    const segment_len = norm(segment_vec);
    
    if (segment_len < EPSILON) {
      // Skip zero-length segments
      continue;
    }
    
    // Calculate the nearest point on this segment
    const v1 = vector_from(p1, pt);
    const seg_unit = unit(segment_vec);
    
    // Project v1 onto the segment line
    let proj = 0;
    for (let j = 0; j < seg_unit.length; j++) {
      proj += v1[j] * seg_unit[j];
    }
    
    // Clamp to segment
    proj = Math.max(0, Math.min(segment_len, proj));
    
    // Calculate the point on the segment
    const segment_point = p1.map((val, j) => val + proj * seg_unit[j]);
    
    // Calculate square distance to this point
    const dist_sq = vector_from(pt, segment_point).reduce((acc, val) => acc + val * val, 0);
    
    if (dist_sq < min_dist_sq) {
      min_dist_sq = dist_sq;
      min_point = segment_point;
      min_dist_along = dist_along + proj;
      min_segment = i;
    }
    
    dist_along += segment_len;
  }
  
  return [min_point, min_dist_along, min_segment];
}

/**
 * Cut a path into shorter subpaths of specified length
 * @param {Array} path - The path to cut up
 * @param {number} cutdist - Maximum length of returned subpaths
 * @param {boolean} [closed=false] - If true, treat the path as a closed polygon
 * @returns {Array} List of path segments
 */
export function path_cut(path, cutdist, closed=false) {
  assert(is_path(path), "First argument must be a path");
  assert(is_num(cutdist) && cutdist > 0, "Second argument must be a positive number");
  
  if (path.length < 2) {
    return [path];
  }
  
  const plen = path_length(path, closed);
  if (plen <= cutdist) {
    return [path];
  }
  
  // Round up to find number of segments
  const pieces = Math.ceil(plen / cutdist);
  const piece_len = plen / pieces;
  
  // Resample the path first
  const resampled = path_resample(path, piece_len, pieces + 1, closed);
  
  // Break into pieces
  const result = [];
  for (let i = 0; i < pieces; i++) {
    result.push(resampled.slice(i, i + 2));
  }
  
  return result;
}

/**
 * Subdivides each segment of a path
 * @param {Array} path - The path to subdivide
 * @param {number} [N=1] - Number of equal parts to divide each segment into
 * @param {boolean} [closed=false] - If true, treat the path as a closed polygon
 * @returns {Array} The subdivided path
 */
export function subdivide_path(path, N=1, closed=false) {
  assert(is_path(path), "First argument must be a path");
  assert(is_num(N) && N > 0, "Second argument must be a positive number");
  
  if (path.length < 2 || N <= 1) {
    return path;
  }
  
  const segments = closed ? path.length : path.length - 1;
  const result = [];
  
  for (let i = 0; i < segments; i++) {
    const p1 = path[i];
    result.push(p1);
    
    const p2 = path[(i + 1) % path.length];
    
    for (let j = 1; j < N; j++) {
      const frac = j / N;
      const pt = p1.map((val, k) => lerp(val, p2[k], frac));
      result.push(pt);
    }
  }
  
  // Add the last point if not closed
  if (!closed) {
    result.push(path[path.length - 1]);
  }
  
  return result;
}

/**
 * Determines if a point is contained in a polygon
 * @param {Array} point - The point to check
 * @param {Array} poly - The polygon path
 * @returns {boolean} True if the point is inside the polygon
 */
export function point_in_polygon(point, poly) {
  assert(is_vector(point) && point.length >= 2, "First argument must be a 2D or 3D point");
  assert(is_path(poly), "Second argument must be a path");
  
  // For 3D points, project onto the XY plane
  const x = point[0];
  const y = point[1];
  
  // Ray casting algorithm
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    
    // Check if the point is on the polygon edge
    const on_edge = (yi === y && xi === x) || 
                   (yj === y && xj === x) ||
                   (yi !== yj && y === yi + (yj - yi) * (x - xi) / (xj - xi) && x >= Math.min(xi, xj) && x <= Math.max(xi, xj));
                   
    if (on_edge) return true;
    
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Gets the tangent vector at a point along a path
 * @param {Array} path - The path to get the tangent for
 * @param {number} loc - The distance along the path to find the tangent
 * @param {boolean} [closed=false] - If true, treat the path as a closed polygon
 * @returns {Array} The normalized tangent vector
 */
export function path_tangent(path, loc, closed=false) {
  assert(is_path(path), "First argument must be a path");
  assert(is_num(loc) && loc >= 0, "Second argument must be a non-negative number");
  
  const plen = path_length(path, closed);
  if (loc >= plen) {
    loc = plen - EPSILON;
  }
  
  const [seg_idx, seg_pos] = path_position(path, loc, closed);
  const p1 = path[seg_idx];
  const p2 = path[(seg_idx + 1) % path.length];
  const tangent = vector_from(p1, p2);
  
  return unit(tangent);
}

/**
 * Calculates the normal vector for a 2D path at a specific location
 * @param {Array} path - The 2D path to get the normal for
 * @param {number} loc - The distance along the path to find the normal
 * @param {boolean} [closed=false] - If true, treat the path as a closed polygon
 * @returns {Array} The normal vector (perpendicular to tangent)
 */
export function path_normal(path, loc, closed=false) {
  assert(is_path(path), "First argument must be a path");
  assert(path[0].length === 2, "Path must be 2D");
  
  const tangent = path_tangent(path, loc, closed);
  // For 2D, normal is perpendicular to tangent: [-y, x]
  return [-tangent[1], tangent[0]];
}

/**
 * Makes a path where all segments have the same length
 * @param {Array} path - The path to equalize
 * @param {number} [n] - Number of segments in output path (non-closed) or n+1 (closed)
 * @param {boolean} [closed=false] - If true, treat the path as a closed polygon
 * @returns {Array} Path with equalized segment lengths
 */
export function path_equal_segments(path, n, closed=false) {
  return path_resample(path, undefined, n, closed);
}
