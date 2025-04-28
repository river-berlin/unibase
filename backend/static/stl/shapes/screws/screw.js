import { closePoints } from "./closePoints.js"
import { threadPitch, screwResolution, toothWidth } from "./standards.js"
import { cube } from "../cuboid.js";


/**
 * Creates a vertical rod at the origin with external threads
 * @param {Object} options - Configuration options
 * @returns {Object} A polyhedron object representing the screw thread
 */
export function screwThread(options = {}) {
  const outer_diam = options.outer_diam || 6;
  const height = options.height || 10;
  const pitch = options.pitch || threadPitch(outer_diam);
  const tooth_angle = options.tooth_angle || 30;
  const tolerance = options.tolerance || 0.4;
  const tip_height = options.tip_height || 0;
  let tooth_height = options.tooth_height || pitch;
  let tip_min_fract = options.tip_min_fract || 0;
  
  // Validate parameters
  tip_min_fract = (tip_min_fract < 0) ? 0 : ((tip_min_fract > 0.9999) ? 0.9999 : tip_min_fract);
  
  // Calculate dimensions
  const outer_diam_cor = outer_diam + 0.25 * tolerance; // Plastic shrinkage correction
  const inner_diam = outer_diam - tooth_height / Math.tan(tooth_angle * Math.PI / 180);
  const or = (outer_diam_cor < screwResolution) ? screwResolution / 2 : outer_diam_cor / 2;
  const ir = (inner_diam < screwResolution) ? screwResolution / 2 : inner_diam / 2;
  const height_adjusted = (height < screwResolution) ? screwResolution : height;
  
  // Calculate steps
  const steps_per_loop_try = Math.ceil(2 * Math.PI * or / screwResolution);
  const steps_per_loop = (steps_per_loop_try < 4) ? 4 : steps_per_loop_try;
  const hs_ext = 3;
  const hsteps = Math.ceil(3 * height_adjusted / pitch) + 2 * hs_ext;
  
  const extent = or - ir;
  
  // Calculate tip parameters
  const tip_start = height_adjusted - tip_height;
  const tip_height_sc = tip_height / (1 - tip_min_fract);
  
  const tip_height_ir = (tip_height_sc > tooth_height / 2) ? 
    tip_height_sc - tooth_height / 2 : tip_height_sc;
  
  const tip_height_w = (tip_height_sc > tooth_height) ? tooth_height : tip_height_sc;
  const tip_wstart = height_adjusted + tip_height_sc - tip_height - tip_height_w;
  
  // Generate point arrays
  const pointarrays = [];
  
  for (let hs = 0; hs <= hsteps; hs++) {
    const points = [];
    
    for (let s = 0; s < steps_per_loop; s++) {
      const ang_full = s * 360.0 / steps_per_loop;
      const ang_pn = Math.atan2(Math.sin(ang_full * Math.PI / 180), Math.cos(ang_full * Math.PI / 180)) * 180 / Math.PI;
      const ang = ang_pn < 0 ? ang_pn + 360 : ang_pn;
      
      const h_fudge = pitch * 0.001;
      
      let h_mod;
      if (hs % 3 === 2) {
        if (s === steps_per_loop - 1) {
          h_mod = tooth_height - h_fudge;
        } else if (s === steps_per_loop - 2) {
          h_mod = tooth_height / 2;
        } else {
          h_mod = 0;
        }
      } else if (hs % 3 === 0) {
        if (s === steps_per_loop - 1) {
          h_mod = pitch - tooth_height / 2;
        } else if (s === steps_per_loop - 2) {
          h_mod = pitch - tooth_height + h_fudge;
        } else {
          h_mod = 0;
        }
      } else {
        if (s === steps_per_loop - 1) {
          h_mod = pitch - tooth_height / 2 + h_fudge;
        } else if (s === steps_per_loop - 2) {
          h_mod = tooth_height / 2;
        } else {
          h_mod = 0;
        }
      }
      
      let h_level;
      if (hs % 3 === 2) {
        h_level = tooth_height - h_fudge;
      } else if (hs % 3 === 0) {
        h_level = 0;
      } else {
        h_level = tooth_height / 2;
      }
      
      let h_ub = Math.floor((hs - hs_ext) / 3) * pitch + h_level + ang * pitch / 360.0 - h_mod;
      const h_max = height_adjusted - (hsteps - hs) * h_fudge;
      const h_min = hs * h_fudge;
      const h = (h_ub < h_min) ? h_min : ((h_ub > h_max) ? h_max : h_ub);
      
      const ht = h - tip_start;
      const hf_ir = ht / tip_height_ir;
      const ht_w = h - tip_wstart;
      const hf_w_t = ht_w / tip_height_w;
      const hf_w = (hf_w_t < 0) ? 0 : ((hf_w_t > 1) ? 1 : hf_w_t);
      
      const ext_tip = (h <= tip_wstart) ? extent : (1 - hf_w) * extent;
      const wnormal = toothWidth(ang, h, pitch, tooth_height, ext_tip);
      const w = (h <= tip_wstart) ? wnormal :
        (1 - hf_w) * wnormal +
        hf_w * (0.1 * screwResolution + (wnormal * wnormal * wnormal /
          (ext_tip * ext_tip + 0.1 * screwResolution)));
      
      let r;
      if (ht <= 0) {
        r = ir + w;
      } else {
        if (ht < tip_height_ir) {
          r = ((2 / (1 + (hf_ir * hf_ir)) - 1) * ir) + w;
        } else {
          r = 0 + w;
        }
      }
      
      points.push([
        r * Math.cos(ang * Math.PI / 180),
        r * Math.sin(ang * Math.PI / 180),
        h
      ]);
    }
    
    pointarrays.push(points);
  }
  
  // Create the polyhedron using closePoints
  const screw = closePoints(pointarrays);
  
  return screw
}

export function augerThread({
  outerDiam,
  innerDiam,
  height,
  pitch,
  toothAngle = 30,
  tolerance = 0.4,
  tipHeight = 0,
  tipMinFract = 0,
  position = {}
}) {
  const toothHeight = Math.tan((toothAngle * Math.PI) / 180) * (outerDiam - innerDiam);

  return screwThread({
    outerDiam,
    height,
    pitch,
    toothAngle,
    tolerance,
    tipHeight,
    toothHeight,
    tipMinFract,
    position
  });
}