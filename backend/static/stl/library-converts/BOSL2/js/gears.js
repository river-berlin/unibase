// LibFile: gears.js
// This file provides functions for creating various types of gears including
// spur gears, bevel gears, racks, worms and worm gears.
// Inspired by code by Leemon Baird, 2011, Leemon@Leemon.com

import { is_undef, is_list, is_num, is_bool, is_string, assert, is_vector } from '../../../compat/index.js';
import { EPSILON, PHI, constrain } from './math.js';
import { sin, cos, tan, asin, acos, atan, atan2, deg2rad, rad2deg } from './trigonometry.js';
import { unit, norm, cross } from './vectors.js';
import { move, rot, translate } from './transforms.js';
import { circle, square } from './shapes2d.js';
import { cylinder, cube, sphere } from './shapes3d.js';
import { is_path, path_length } from './paths.js';
import { round_corners } from './rounding.js';
import { CENTER, LEFT, RIGHT, TOP, BOTTOM, FRONT, BACK } from './constants.js';

// Global constants for gears
export const _GEAR_PITCH = 5;
export const _GEAR_HELICAL = 0;
export const _GEAR_THICKNESS = 10;
export const _GEAR_PA = 20; // Pressure angle

// Function: pitch_radius()
// Description: Calculate the pitch radius of a gear based on teeth and module/pitch
// Arguments:
//   mod = The gear module. Default: 1
//   teeth = Number of teeth on the gear.
//   circ_pitch = The circular pitch, the distance between teeth centers around the pitch circle. Default: undef
//   diam_pitch = The diametral pitch, the number of teeth per inch of diameter. Default: undef
export function pitch_radius(mod, teeth, circ_pitch, diam_pitch) {
    assert(is_num(teeth) && teeth > 0, "The 'teeth' parameter must be a positive number");
    
    if (!is_undef(mod)) {
        assert(is_num(mod) && mod > 0, "The 'mod' parameter must be a positive number");
        return mod * teeth / 2;
    }
    
    if (!is_undef(circ_pitch)) {
        assert(is_num(circ_pitch) && circ_pitch > 0, "The 'circ_pitch' parameter must be a positive number");
        return teeth * circ_pitch / (2 * Math.PI);
    }
    
    if (!is_undef(diam_pitch)) {
        assert(is_num(diam_pitch) && diam_pitch > 0, "The 'diam_pitch' parameter must be a positive number");
        return teeth / (2 * diam_pitch);
    }
    
    assert(false, "At least one of 'mod', 'circ_pitch', or 'diam_pitch' must be provided");
}

// Function: outer_radius()
// Description: Calculate the outer/addendum radius of a gear
// Arguments:
//   pitch_r = The pitch radius of the gear
//   mod = The gear module. Default: 1
//   teeth = Number of teeth on the gear.
//   profile_shift = Profile shift factor. Default: 0
//   internal = If true, create an internal gear. Default: false
export function outer_radius(pitch_r, mod, teeth, profile_shift=0, internal=false) {
    assert(is_num(pitch_r) && pitch_r > 0, "The 'pitch_r' parameter must be a positive number");
    assert(is_num(mod) && mod > 0, "The 'mod' parameter must be a positive number");
    
    const addendum = mod * (1 + profile_shift);
    return internal ? pitch_r - addendum : pitch_r + addendum;
}

// Function: root_radius()
// Description: Calculate the root/dedendum radius of a gear
// Arguments:
//   pitch_r = The pitch radius of the gear
//   mod = The gear module. Default: 1
//   teeth = Number of teeth on the gear.
//   clearance = Additional clearance. Default: 0.25
//   profile_shift = Profile shift factor. Default: 0
//   internal = If true, create an internal gear. Default: false
export function root_radius(pitch_r, mod, teeth, clearance=0.25, profile_shift=0, internal=false) {
    assert(is_num(pitch_r) && pitch_r > 0, "The 'pitch_r' parameter must be a positive number");
    assert(is_num(mod) && mod > 0, "The 'mod' parameter must be a positive number");
    
    const dedendum = mod * (1.25 + clearance - profile_shift);
    return internal ? pitch_r + dedendum : pitch_r - dedendum;
}

// Function: base_radius()
// Description: Calculate the base circle radius of a gear
// Arguments:
//   pitch_r = The pitch radius of the gear
//   pressure_angle = The pressure angle in degrees. Default: 20
export function base_radius(pitch_r, pressure_angle=20) {
    assert(is_num(pitch_r) && pitch_r > 0, "The 'pitch_r' parameter must be a positive number");
    assert(is_num(pressure_angle), "The 'pressure_angle' parameter must be a number");
    
    return pitch_r * cos(pressure_angle);
}

// Function: circular_pitch()
// Description: Calculate the circular pitch of a gear
// Arguments:
//   mod = The gear module. Default: 1
//   diam_pitch = The diametral pitch, the number of teeth per inch of diameter. Default: undef
export function circular_pitch(mod, diam_pitch) {
    if (!is_undef(mod)) {
        assert(is_num(mod) && mod > 0, "The 'mod' parameter must be a positive number");
        return Math.PI * mod;
    }
    
    if (!is_undef(diam_pitch)) {
        assert(is_num(diam_pitch) && diam_pitch > 0, "The 'diam_pitch' parameter must be a positive number");
        return Math.PI / diam_pitch;
    }
    
    assert(false, "At least one of 'mod' or 'diam_pitch' must be provided");
}

// Function: diametral_pitch()
// Description: Calculate the diametral pitch of a gear
// Arguments:
//   mod = The gear module. Default: 1
//   circ_pitch = The circular pitch, the distance between teeth centers around the pitch circle. Default: undef
export function diametral_pitch(mod, circ_pitch) {
    if (!is_undef(mod)) {
        assert(is_num(mod) && mod > 0, "The 'mod' parameter must be a positive number");
        return 1 / mod;
    }
    
    if (!is_undef(circ_pitch)) {
        assert(is_num(circ_pitch) && circ_pitch > 0, "The 'circ_pitch' parameter must be a positive number");
        return Math.PI / circ_pitch;
    }
    
    assert(false, "At least one of 'mod' or 'circ_pitch' must be provided");
}

// Function: module_value()
// Description: Calculate the module of a gear
// Arguments:
//   circ_pitch = The circular pitch, the distance between teeth centers around the pitch circle. Default: undef
//   diam_pitch = The diametral pitch, the number of teeth per inch of diameter. Default: undef
export function module_value(circ_pitch, diam_pitch) {
    if (!is_undef(circ_pitch)) {
        assert(is_num(circ_pitch) && circ_pitch > 0, "The 'circ_pitch' parameter must be a positive number");
        return circ_pitch / Math.PI;
    }
    
    if (!is_undef(diam_pitch)) {
        assert(is_num(diam_pitch) && diam_pitch > 0, "The 'diam_pitch' parameter must be a positive number");
        return 1 / diam_pitch;
    }
    
    assert(false, "At least one of 'circ_pitch' or 'diam_pitch' must be provided");
}

// Function: gear_tooth_profile()
// Description: Create a 2D profile of a single gear tooth
// Arguments:
//   pitch_r = The pitch radius of the gear
//   root_r = The root radius of the gear
//   base_r = The base radius of the gear
//   outer_r = The outer radius of the gear
//   pressure_angle = The pressure angle in degrees. Default: 20
//   clearance = Additional clearance. Default: 0.25
//   backlash = The backlash amount. Default: 0
//   internal = If true, create an internal gear tooth. Default: false
export function gear_tooth_profile(pitch_r, root_r, base_r, outer_r, pressure_angle=20, clearance=0.25, backlash=0, internal=false) {
    assert(is_num(pitch_r) && pitch_r > 0, "The 'pitch_r' parameter must be a positive number");
    assert(is_num(root_r) && root_r > 0, "The 'root_r' parameter must be a positive number");
    assert(is_num(base_r) && base_r > 0, "The 'base_r' parameter must be a positive number");
    assert(is_num(outer_r) && outer_r > 0, "The 'outer_r' parameter must be a positive number");
    
    // Calculate the angular pitch (angle between teeth)
    const pitch_angle = 2 * Math.PI / (2 * pitch_r / module_value(circular_pitch(1)));
    
    // Calculate the tooth thickness at the pitch circle
    const tooth_thickness = (Math.PI * pitch_r / (2 * pitch_r / module_value(circular_pitch(1)))) - backlash;
    
    // Calculate the angle to the start of the involute
    const base_angle = Math.acos(base_r / pitch_r);
    
    // Calculate the angle to the end of the involute
    const outer_angle = Math.sqrt((outer_r * outer_r) / (base_r * base_r) - 1);
    
    // Calculate the number of steps for the involute curve
    const steps = Math.max(5, Math.ceil(16 * outer_angle));
    
    // Generate the involute curve points
    const involute_points = [];
    for (let i = 0; i <= steps; i++) {
        const angle = i * outer_angle / steps;
        const r = base_r * Math.sqrt(1 + angle * angle);
        const theta = angle - Math.atan(angle);
        
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        
        involute_points.push([x, y]);
    }
    
    // Mirror the involute curve for the other side of the tooth
    const mirrored_points = involute_points.slice().reverse().map(p => [p[0], -p[1]]);
    
    // Combine the points to form the tooth profile
    const tooth_points = [];
    
    // Add root circle points
    tooth_points.push([root_r * Math.cos(-pitch_angle/2), root_r * Math.sin(-pitch_angle/2)]);
    
    // Add involute curve points
    tooth_points.push(...involute_points);
    
    // Add outer circle point
    tooth_points.push([outer_r * Math.cos(0), outer_r * Math.sin(0)]);
    
    // Add mirrored involute curve points
    tooth_points.push(...mirrored_points);
    
    // Add final root circle point
    tooth_points.push([root_r * Math.cos(pitch_angle/2), root_r * Math.sin(pitch_angle/2)]);
    
    return tooth_points;
}

// Function: spur_gear2d()
// Description: Create a 2D spur gear
// Arguments:
//   teeth = Number of teeth on the gear
//   mod = The gear module. Default: 1
//   pressure_angle = The pressure angle in degrees. Default: 20
//   clearance = Additional clearance. Default: 0.25
//   backlash = The backlash amount. Default: 0
//   internal = If true, create an internal gear. Default: false
//   profile_shift = Profile shift factor. Default: 0
export function spur_gear2d(teeth, mod=1, pressure_angle=20, clearance=0.25, backlash=0, internal=false, profile_shift=0) {
    assert(is_num(teeth) && teeth > 0, "The 'teeth' parameter must be a positive number");
    assert(is_num(mod) && mod > 0, "The 'mod' parameter must be a positive number");
    
    // Calculate the various radii
    const pitch_r = pitch_radius(mod, teeth);
    const base_r = base_radius(pitch_r, pressure_angle);
    const outer_r = outer_radius(pitch_r, mod, teeth, profile_shift, internal);
    const root_r = root_radius(pitch_r, mod, teeth, clearance, profile_shift, internal);
    
    // Get the tooth profile
    const tooth = gear_tooth_profile(pitch_r, root_r, base_r, outer_r, pressure_angle, clearance, backlash, internal);
    
    // Calculate the angular pitch (angle between teeth)
    const pitch_angle = 360 / teeth;
    
    // Create the full gear by rotating the tooth profile
    const gear_points = [];
    for (let i = 0; i < teeth; i++) {
        const angle = i * pitch_angle;
        const rotated_tooth = tooth.map(p => {
            const x = p[0] * Math.cos(angle * Math.PI / 180) - p[1] * Math.sin(angle * Math.PI / 180);
            const y = p[0] * Math.sin(angle * Math.PI / 180) + p[1] * Math.cos(angle * Math.PI / 180);
            return [x, y];
        });
        
        gear_points.push(...rotated_tooth);
    }
    
    return gear_points;
}

// Function: spur_gear()
// Description: Create a 3D spur gear
// Arguments:
//   teeth = Number of teeth on the gear
//   mod = The gear module. Default: 1
//   thickness = The thickness of the gear. Default: 10
//   pressure_angle = The pressure angle in degrees. Default: 20
//   clearance = Additional clearance. Default: 0.25
//   backlash = The backlash amount. Default: 0
//   internal = If true, create an internal gear. Default: false
//   profile_shift = Profile shift factor. Default: 0
//   helical = The helical angle in degrees. Default: 0
//   slices = Number of vertical layers to divide gear into. Default: 1
export function spur_gear(teeth, mod=1, thickness=10, pressure_angle=20, clearance=0.25, backlash=0, internal=false, profile_shift=0, helical=0, slices=1) {
    assert(is_num(teeth) && teeth > 0, "The 'teeth' parameter must be a positive number");
    assert(is_num(mod) && mod > 0, "The 'mod' parameter must be a positive number");
    assert(is_num(thickness) && thickness > 0, "The 'thickness' parameter must be a positive number");
    
    // Get the 2D gear profile
    const gear2d = spur_gear2d(teeth, mod, pressure_angle, clearance, backlash, internal, profile_shift);
    
    // Extrude the 2D profile to create a 3D gear
    // In a real implementation, this would use THREE.js or similar to create the 3D geometry
    // For now, we'll return an object with the necessary information
    return {
        type: 'spur_gear',
        profile: gear2d,
        teeth: teeth,
        mod: mod,
        thickness: thickness,
        pressure_angle: pressure_angle,
        clearance: clearance,
        backlash: backlash,
        internal: internal,
        profile_shift: profile_shift,
        helical: helical,
        slices: slices,
        pitch_radius: pitch_radius(mod, teeth),
        outer_radius: outer_radius(pitch_radius(mod, teeth), mod, teeth, profile_shift, internal),
        root_radius: root_radius(pitch_radius(mod, teeth), mod, teeth, clearance, profile_shift, internal),
        base_radius: base_radius(pitch_radius(mod, teeth), pressure_angle)
    };
}

// Function: gear_rack2d()
// Description: Create a 2D rack for a gear with specified module and teeth count
// Arguments:
//   teeth = Number of teeth to mesh with
//   mod = The gear module. Default: 1
//   height = Height of rack above the pitch line. Default: 2*mod
//   pressure_angle = The pressure angle in degrees. Default: 20
//   backlash = The backlash amount. Default: 0
//   clearance = Additional clearance. Default: 0.25
//   profile_shift = Profile shift factor. Default: 0
//   helical = The helical angle in degrees. Default: 0
export function gear_rack2d(teeth, mod=1, height, pressure_angle=20, backlash=0, clearance=0.25, profile_shift=0, helical=0) {
    assert(is_num(teeth) && teeth > 0, "The 'teeth' parameter must be a positive number");
    assert(is_num(mod) && mod > 0, "The 'mod' parameter must be a positive number");
    
    // Calculate the tooth parameters
    const pitch = Math.PI * mod;
    const addendum = mod * (1 + profile_shift);
    const dedendum = mod * (1.25 + clearance - profile_shift);
    const rack_height = is_undef(height) ? 2 * mod : height;
    
    // Calculate the tooth profile
    const half_tooth = pitch / 4 - backlash / 2;
    const slope_width = addendum * tan(pressure_angle);
    const flat_width = half_tooth - slope_width;
    
    // Create a single tooth profile
    const tooth = [
        [-half_tooth - slope_width, -dedendum],
        [-half_tooth, 0],
        [-flat_width, 0],
        [0, addendum],
        [flat_width, 0],
        [half_tooth, 0],
        [half_tooth + slope_width, -dedendum]
    ];
    
    // Calculate the total length of the rack
    const rack_length = teeth * pitch;
    
    // Create the full rack by repeating the tooth profile
    const rack_points = [];
    for (let i = 0; i < teeth; i++) {
        const offset = i * pitch - rack_length / 2 + pitch / 2;
        const tooth_points = tooth.map(p => [p[0] + offset, p[1]]);
        rack_points.push(...tooth_points);
    }
    
    // Add the back of the rack
    rack_points.push([rack_length / 2, -dedendum]);
    rack_points.push([rack_length / 2, -rack_height]);
    rack_points.push([-rack_length / 2, -rack_height]);
    rack_points.push([-rack_length / 2, -dedendum]);
    
    return rack_points;
}

// Function: gear_rack()
// Description: Create a 3D rack for a gear with specified module and teeth count
// Arguments:
//   teeth = Number of teeth to mesh with
//   mod = The gear module. Default: 1
//   height = Height of rack above the pitch line. Default: 2*mod
//   thickness = The thickness of the rack. Default: 10
//   pressure_angle = The pressure angle in degrees. Default: 20
//   backlash = The backlash amount. Default: 0
//   clearance = Additional clearance. Default: 0.25
//   profile_shift = Profile shift factor. Default: 0
//   helical = The helical angle in degrees. Default: 0
export function gear_rack(teeth, mod=1, height, thickness=10, pressure_angle=20, backlash=0, clearance=0.25, profile_shift=0, helical=0) {
    assert(is_num(teeth) && teeth > 0, "The 'teeth' parameter must be a positive number");
    assert(is_num(mod) && mod > 0, "The 'mod' parameter must be a positive number");
    assert(is_num(thickness) && thickness > 0, "The 'thickness' parameter must be a positive number");
    
    // Get the 2D rack profile
    const rack2d = gear_rack2d(teeth, mod, height, pressure_angle, backlash, clearance, profile_shift, helical);
    
    // Extrude the 2D profile to create a 3D rack
    // In a real implementation, this would use THREE.js or similar to create the 3D geometry
    // For now, we'll return an object with the necessary information
    return {
        type: 'gear_rack',
        profile: rack2d,
        teeth: teeth,
        mod: mod,
        thickness: thickness,
        pressure_angle: pressure_angle,
        backlash: backlash,
        clearance: clearance,
        profile_shift: profile_shift,
        helical: helical,
        height: is_undef(height) ? 2 * mod : height,
        pitch: Math.PI * mod,
        length: teeth * Math.PI * mod
    };
}

// Function: bevel_gear2d()
// Description: Create a 2D bevel gear
// Arguments:
//   teeth = Number of teeth on the gear
//   mod = The gear module. Default: 1
//   cone_angle = The cone angle in degrees. Default: 45
//   pressure_angle = The pressure angle in degrees. Default: 20
//   clearance = Additional clearance. Default: 0.25
//   backlash = The backlash amount. Default: 0
//   profile_shift = Profile shift factor. Default: 0
export function bevel_gear2d(teeth, mod=1, cone_angle=45, pressure_angle=20, clearance=0.25, backlash=0, profile_shift=0) {
    assert(is_num(teeth) && teeth > 0, "The 'teeth' parameter must be a positive number");
    assert(is_num(mod) && mod > 0, "The 'mod' parameter must be a positive number");
    assert(is_num(cone_angle) && cone_angle > 0 && cone_angle < 90, "The 'cone_angle' parameter must be between 0 and 90 degrees");
    
    // Calculate the pitch radius at the large end of the cone
    const pitch_r = pitch_radius(mod, teeth);
    
    // Calculate the pitch angle (half angle of the pitch cone)
    const pitch_angle = Math.atan(Math.sin(cone_angle * Math.PI / 180) / (teeth / 2 + Math.cos(cone_angle * Math.PI / 180)));
    
    // Calculate the various radii
    const base_r = base_radius(pitch_r, pressure_angle);
    const outer_r = outer_radius(pitch_r, mod, teeth, profile_shift, false);
    const root_r = root_radius(pitch_r, mod, teeth, clearance, profile_shift, false);
    
    // Get the tooth profile for a spur gear
    const tooth = gear_tooth_profile(pitch_r, root_r, base_r, outer_r, pressure_angle, clearance, backlash, false);
    
    // Calculate the angular pitch (angle between teeth)
    const pitch_angle_deg = 360 / teeth;
    
    // Create the full gear by rotating the tooth profile
    const gear_points = [];
    for (let i = 0; i < teeth; i++) {
        const angle = i * pitch_angle_deg;
        const rotated_tooth = tooth.map(p => {
            const r = Math.sqrt(p[0] * p[0] + p[1] * p[1]);
            const theta = Math.atan2(p[1], p[0]) + angle * Math.PI / 180;
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta);
            return [x, y];
        });
        
        gear_points.push(...rotated_tooth);
    }
    
    return gear_points;
}

// Function: bevel_gear()
// Description: Create a 3D bevel gear
// Arguments:
//   teeth = Number of teeth on the gear
//   mod = The gear module. Default: 1
//   cone_angle = The cone angle in degrees. Default: 45
//   face_width = The width of the gear face. Default: 5*mod
//   pressure_angle = The pressure angle in degrees. Default: 20
//   clearance = Additional clearance. Default: 0.25
//   backlash = The backlash amount. Default: 0
//   profile_shift = Profile shift factor. Default: 0
//   slices = Number of slices to divide the gear into. Default: 1
export function bevel_gear(teeth, mod=1, cone_angle=45, face_width, pressure_angle=20, clearance=0.25, backlash=0, profile_shift=0, slices=1) {
    assert(is_num(teeth) && teeth > 0, "The 'teeth' parameter must be a positive number");
    assert(is_num(mod) && mod > 0, "The 'mod' parameter must be a positive number");
    assert(is_num(cone_angle) && cone_angle > 0 && cone_angle < 90, "The 'cone_angle' parameter must be between 0 and 90 degrees");
    
    // Calculate the pitch radius at the large end of the cone
    const pitch_r = pitch_radius(mod, teeth);
    
    // Calculate the face width if not specified
    const width = is_undef(face_width) ? 5 * mod : face_width;
    
    // Calculate the pitch angle (half angle of the pitch cone)
    const pitch_angle = Math.atan(Math.sin(cone_angle * Math.PI / 180) / (teeth / 2 + Math.cos(cone_angle * Math.PI / 180)));
    
    // Calculate the cone distance (slant height of the pitch cone)
    const cone_dist = pitch_r / Math.sin(pitch_angle);
    
    // Get the 2D gear profile
    const gear2d = bevel_gear2d(teeth, mod, cone_angle, pressure_angle, clearance, backlash, profile_shift);
    
    // In a real implementation, this would use THREE.js or similar to create the 3D geometry
    // For now, we'll return an object with the necessary information
    return {
        type: 'bevel_gear',
        profile: gear2d,
        teeth: teeth,
        mod: mod,
        cone_angle: cone_angle,
        face_width: width,
        pressure_angle: pressure_angle,
        clearance: clearance,
        backlash: backlash,
        profile_shift: profile_shift,
        slices: slices,
        pitch_radius: pitch_r,
        cone_distance: cone_dist,
        pitch_angle: rad2deg(pitch_angle)
    };
}

// Function: worm2d()
// Description: Create a 2D profile of a worm gear
// Arguments:
//   mod = The gear module. Default: 1
//   pitch = The axial pitch of the worm. Default: PI*mod
//   teeth = Number of teeth (starts) on the worm. Default: 1
//   pressure_angle = The pressure angle in degrees. Default: 20
//   lead_angle = The lead angle of the worm in degrees. Default: undef (calculated from pitch)
//   diameter = The outer diameter of the worm. Default: undef (calculated from module)
export function worm2d(mod=1, pitch, teeth=1, pressure_angle=20, lead_angle, diameter) {
    assert(is_num(mod) && mod > 0, "The 'mod' parameter must be a positive number");
    assert(is_num(teeth) && teeth > 0, "The 'teeth' parameter must be a positive number");
    
    // Calculate the pitch if not specified
    const p = is_undef(pitch) ? Math.PI * mod : pitch;
    
    // Calculate the lead angle if not specified
    const angle = is_undef(lead_angle) ? Math.atan(teeth * p / (Math.PI * (is_undef(diameter) ? 2 * mod * (teeth + 2) : diameter))) * 180 / Math.PI : lead_angle;
    
    // Calculate the outer diameter if not specified
    const d_outer = is_undef(diameter) ? 2 * mod * (teeth + 2) : diameter;
    
    // Calculate the root diameter
    const d_root = d_outer - 2 * mod * 2.2;
    
    // Calculate the pitch diameter
    const d_pitch = d_outer - 2 * mod;
    
    // Calculate the tooth parameters
    const addendum = mod;
    const dedendum = mod * 1.2;
    const tooth_width = p / 2;
    
    // Create the worm profile
    const worm_points = [];
    
    // Add the root circle points
    for (let i = 0; i <= 360; i += 5) {
        const angle_rad = i * Math.PI / 180;
        const x = d_root / 2 * Math.cos(angle_rad);
        const y = d_root / 2 * Math.sin(angle_rad);
        worm_points.push([x, y]);
    }
    
    return {
        points: worm_points,
        mod: mod,
        pitch: p,
        teeth: teeth,
        pressure_angle: pressure_angle,
        lead_angle: angle,
        outer_diameter: d_outer,
        root_diameter: d_root,
        pitch_diameter: d_pitch
    };
}

// Function: worm()
// Description: Create a 3D worm gear
// Arguments:
//   mod = The gear module. Default: 1
//   pitch = The axial pitch of the worm. Default: PI*mod
//   teeth = Number of teeth (starts) on the worm. Default: 1
//   length = The length of the worm. Default: 10*mod
//   pressure_angle = The pressure angle in degrees. Default: 20
//   lead_angle = The lead angle of the worm in degrees. Default: undef (calculated from pitch)
//   diameter = The outer diameter of the worm. Default: undef (calculated from module)
//   slices = Number of slices to divide the worm into. Default: 32
export function worm(mod=1, pitch, teeth=1, length, pressure_angle=20, lead_angle, diameter, slices=32) {
    assert(is_num(mod) && mod > 0, "The 'mod' parameter must be a positive number");
    assert(is_num(teeth) && teeth > 0, "The 'teeth' parameter must be a positive number");
    
    // Calculate the length if not specified
    const l = is_undef(length) ? 10 * mod : length;
    
    // Get the 2D worm profile
    const worm2d_profile = worm2d(mod, pitch, teeth, pressure_angle, lead_angle, diameter);
    
    // In a real implementation, this would use THREE.js or similar to create the 3D geometry
    // For now, we'll return an object with the necessary information
    return {
        type: 'worm',
        profile: worm2d_profile,
        mod: mod,
        pitch: worm2d_profile.pitch,
        teeth: teeth,
        length: l,
        pressure_angle: pressure_angle,
        lead_angle: worm2d_profile.lead_angle,
        outer_diameter: worm2d_profile.outer_diameter,
        root_diameter: worm2d_profile.root_diameter,
        pitch_diameter: worm2d_profile.pitch_diameter,
        slices: slices
    };
}

// Function: worm_gear()
// Description: Create a 3D worm gear that meshes with a worm
// Arguments:
//   teeth = Number of teeth on the gear
//   mod = The gear module. Default: 1
//   worm_diam = The outer diameter of the worm. Default: undef (calculated from module)
//   worm_starts = Number of starts (teeth) on the worm. Default: 1
//   worm_lead_angle = The lead angle of the worm in degrees. Default: undef (calculated from pitch)
//   pressure_angle = The pressure angle in degrees. Default: 20
//   thickness = The thickness of the gear. Default: 10
//   backlash = The backlash amount. Default: 0
//   clearance = Additional clearance. Default: 0.25
//   slices = Number of slices to divide the gear into. Default: 1
export function worm_gear(teeth, mod=1, worm_diam, worm_starts=1, worm_lead_angle, pressure_angle=20, thickness=10, backlash=0, clearance=0.25, slices=1) {
    assert(is_num(teeth) && teeth > 0, "The 'teeth' parameter must be a positive number");
    assert(is_num(mod) && mod > 0, "The 'mod' parameter must be a positive number");
    
    // Calculate the worm diameter if not specified
    const worm_diameter = is_undef(worm_diam) ? 2 * mod * (worm_starts + 2) : worm_diam;
    
    // Calculate the pitch radius of the gear
    const pitch_r = pitch_radius(mod, teeth);
    
    // Calculate the outer radius of the gear
    const outer_r = outer_radius(pitch_r, mod, teeth, 0, false);
    
    // Calculate the root radius of the gear
    const root_r = root_radius(pitch_r, mod, teeth, clearance, 0, false);
    
    // In a real implementation, this would use THREE.js or similar to create the 3D geometry
    // For now, we'll return an object with the necessary information
    return {
        type: 'worm_gear',
        teeth: teeth,
        mod: mod,
        worm_diameter: worm_diameter,
        worm_starts: worm_starts,
        worm_lead_angle: worm_lead_angle,
        pressure_angle: pressure_angle,
        thickness: thickness,
        backlash: backlash,
        clearance: clearance,
        slices: slices,
        pitch_radius: pitch_r,
        outer_radius: outer_r,
        root_radius: root_r
    };
}

// Function: gear_dist()
// Description: Calculate the distance between two gears
// Arguments:
//   gear1 = The first gear object
//   gear2 = The second gear object
//   backlash = The backlash amount. Default: 0
export function gear_dist(gear1, gear2, backlash=0) {
    assert(gear1 && gear2, "Both gear objects must be provided");
    
    // Handle different gear combinations
    if (gear1.type === 'spur_gear' && gear2.type === 'spur_gear') {
        // Two spur gears
        return gear1.pitch_radius + gear2.pitch_radius + backlash;
    } else if ((gear1.type === 'spur_gear' && gear2.type === 'gear_rack') || 
               (gear1.type === 'gear_rack' && gear2.type === 'spur_gear')) {
        // Spur gear and rack
        const gear = gear1.type === 'spur_gear' ? gear1 : gear2;
        return gear.pitch_radius + backlash;
    } else if (gear1.type === 'worm' && gear2.type === 'worm_gear') {
        // Worm and worm gear
        return gear1.pitch_diameter / 2 + gear2.pitch_radius + backlash;
    } else if (gear1.type === 'worm_gear' && gear2.type === 'worm') {
        // Worm gear and worm
        return gear1.pitch_radius + gear2.pitch_diameter / 2 + backlash;
    } else if (gear1.type === 'bevel_gear' && gear2.type === 'bevel_gear') {
        // Two bevel gears
        // The distance depends on the cone angles
        const cone_dist1 = gear1.cone_distance;
        const cone_dist2 = gear2.cone_distance;
        return Math.sqrt(cone_dist1 * cone_dist1 + cone_dist2 * cone_dist2 - 2 * cone_dist1 * cone_dist2 * Math.cos((gear1.cone_angle + gear2.cone_angle) * Math.PI / 180)) + backlash;
    }
    
    // Default case
    return 0;
}
