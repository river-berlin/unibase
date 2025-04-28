// Converted from OpenSCAD to JavaScript ESModule with camelCase naming
// Original by Ryan A. Colyer (CC0)
// https://www.thingiverse.com/thing:1686322
import { lookup } from "../../compat/lookup.js";

export const screwResolution = 0.2; // in mm

/**
 * Calculate tooth width at a given angle and height
 * @param {number} a - Angle
 * @param {number} h - Height
 * @param {number} pitch - Thread pitch
 * @param {number} tooth_height - Height of the tooth
 * @param {number} extent - Extent of the tooth
 * @returns {number} The tooth width
 */
export function toothWidth(a, h, pitch, tooth_height, extent) {
  const ang_full = h * 360.0 / pitch - a;
  const ang_pn = Math.atan2(Math.sin(ang_full * Math.PI / 180), Math.cos(ang_full * Math.PI / 180)) * 180 / Math.PI;
  const ang = ang_pn < 0 ? ang_pn + 360 : ang_pn;
  const frac = ang / 360;
  const tfrac_half = tooth_height / (2 * pitch);
  const tfrac_cut = 2 * tfrac_half;
  
  if (frac > tfrac_cut) {
    return 0;
  } else if (frac <= tfrac_half) {
    return (frac / tfrac_half) * extent;
  } else {
    return (1 - (frac - tfrac_half) / tfrac_half) * extent;
  }
}

export function threadPitch(diameter) {
  if (diameter <= 64) {
    return lookup(diameter, [
      [2, 0.4], [2.5, 0.45], [3, 0.5], [4, 0.7], [5, 0.8], [6, 1.0],
      [7, 1.0], [8, 1.25], [10, 1.5], [12, 1.75], [14, 2.0], [16, 2.0],
      [18, 2.5], [20, 2.5], [22, 2.5], [24, 3.0], [27, 3.0], [30, 3.5],
      [33, 3.5], [36, 4.0], [39, 4.0], [42, 4.5], [48, 5.0], [52, 5.0],
      [56, 5.5], [60, 5.5], [64, 6.0]
    ]);
  } else {
    return diameter * 6.0 / 64;
  }
}

export function hexAcrossFlats(diameter) {
  if (diameter <= 64) {
    return lookup(diameter, [
      [2, 4], [2.5, 5], [3, 5.5], [3.5, 6], [4, 7], [5, 8], [6, 10],
      [7, 11], [8, 13], [10, 16], [12, 18], [14, 21], [16, 24], [18, 27],
      [20, 30], [22, 34], [24, 36], [27, 41], [30, 46], [33, 50],
      [36, 55], [39, 60], [42, 65], [48, 75], [52, 80], [56, 85],
      [60, 90], [64, 95]
    ]);
  } else {
    return diameter * 95 / 64;
  }
}

export function hexAcrossCorners(diameter) {
  return hexAcrossFlats(diameter) / Math.cos(Math.PI / 6);
}

export function hexDriveAcrossFlats(diameter) {
  if (diameter <= 64) {
    return lookup(diameter, [
      [2, 1.5], [2.5, 2], [3, 2.5], [3.5, 3], [4, 3], [5, 4], [6, 5],
      [7, 5], [8, 6], [10, 8], [12, 10], [14, 12], [16, 14], [18, 15],
      [20, 17], [22, 18], [24, 19], [27, 20], [30, 22], [33, 24],
      [36, 27], [39, 30], [42, 32], [48, 36], [52, 36], [56, 41],
      [60, 42], [64, 46]
    ]);
  } else {
    return diameter * 46 / 64;
  }
}

export function hexDriveAcrossCorners(diameter) {
  return hexDriveAcrossFlats(diameter) / Math.cos(Math.PI / 6);
}

export function countersunkDriveAcrossFlats(diameter) {
  if (diameter <= 14) {
    return hexDriveAcrossFlats(hexDriveAcrossFlats(diameter));
  } else {
    return Math.round(0.6 * diameter);
  }
}

export function countersunkDriveAcrossCorners(diameter) {
  return countersunkDriveAcrossFlats(diameter) / Math.cos(Math.PI / 6);
}

export function nutThickness(diameter) {
  if (diameter <= 64) {
    return lookup(diameter, [
      [2, 1.6], [2.5, 2], [3, 2.4], [3.5, 2.8], [4, 3.2], [5, 4.7],
      [6, 5.2], [7, 6.0], [8, 6.8], [10, 8.4], [12, 10.8], [14, 12.8],
      [16, 14.8], [18, 15.8], [20, 18.0], [22, 21.1], [24, 21.5],
      [27, 23.8], [30, 25.6], [33, 28.7], [36, 31.0], [42, 34],
      [48, 38], [56, 45], [64, 51]
    ]);
  } else {
    return diameter * 51 / 64;
  }
}
