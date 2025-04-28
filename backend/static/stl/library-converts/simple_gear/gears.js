// Import common utilities from compat folder
import { linear_extrude } from "../../compat/linear_extrude.js";

// Import shape operations from shapes folder
import { Polygon } from "../../shapes/polygon.js";
import { Cylinder } from "../../shapes/cylinder.js";
import { union, difference, polyhedron } from "../../basics.js";

/**
 * Constants
 */
const in_to_mm = 25.4;
const rad_to_deg = 180 / Math.PI;
const deg_to_rad = Math.PI / 180;

/**
 * Functions
 */
function fn_parametric_points(fx, fy, t0 = 0, t1 = 10, delta = 0.01) {
    const points = [];
    for (let i = t0; i <= t1; i += delta) {
        points.push([fx(i), fy(i)]);
    }
    return points;
}

function fn_reverse(vector) {
    const result = [];
    for (let i = 0; i < vector.length; i++) {
        result.push(vector[vector.length - 1 - i]);
    }
    return result;
}

/**
 * Maths
 */
function fn_calc_module(P) { return in_to_mm / P; }
function fn_calc_addendum(P) { return (1/P) * in_to_mm; }
function fn_calc_dedendum(P) { return (1.25/P) * in_to_mm; }
function fn_calc_dp(N, P) { return (N/P) * in_to_mm; }
function fn_calc_db(N, P, pa) { return fn_calc_dp(N, P) * Math.cos(pa * deg_to_rad); }
function fn_calc_dr(N, P) { return fn_calc_dp(N, P) - 2 * fn_calc_dedendum(P); }
function fn_calc_circular_pitch(P) { return (Math.PI / P) * in_to_mm; }
function fn_calc_thickness(P) { return (1.5708 / P) * in_to_mm; }
function fn_calc_alpha(dp, db, pa) { return ((Math.sqrt(Math.pow(dp, 2) - Math.pow(db, 2))/db) * rad_to_deg - pa); }
function fn_calc_clearance(P) { return fn_calc_dedendum(P) - fn_calc_addendum(P); }
function fn_calc_center_distance(N1, N2, P) { return in_to_mm * (N1 + N2) / (2 * P); }

/**
 * Modules
 */

/**
 * Given some parameters, this method will generate a spur gear
 * with an involute curve. Accepted paramters include:
 *  - N = How many teeth
 *  - P = Diametral pitch (all gears should have the same P)
 *  - pa = pressure angle (recommended to remain at 14.5)
 */
function module_spur_gear(N, P = 12, pa = 14.5, children) {
    const dp = fn_calc_dp(N, P);
    const db = fn_calc_db(N, P, pa);
    const dr = fn_calc_dr(N, P);
    const a = fn_calc_addendum(P);
    const b = fn_calc_dedendum(P);
    const c = fn_calc_clearance(P);
    const p = fn_calc_circular_pitch(P);

    // Undercut adjustment
    // NOTE: this might not be great? IDK
    const undercut = 1 * c;

    // Calculate radius to begin the involute calculations
    const r = (db - undercut) * 0.5;
    const alpha = fn_calc_alpha(dp, db, pa);
    const beta = ((360 / (4 * N)) - alpha) * 2;

    // Create the involute tooth shape
    function involute_tooth() {
        const x = (t) => (r * (Math.cos(t * rad_to_deg) + t * Math.sin(t * rad_to_deg)));
        const y = (t) => (r * (Math.sin(t * rad_to_deg) - t * Math.cos(t * rad_to_deg)));
        const x2 = (t) => r * (Math.cos(-t * rad_to_deg - beta) - t * Math.sin(-t * rad_to_deg - beta));
        const y2 = (t) => r * (Math.sin(-t * rad_to_deg - beta) + t * Math.cos(-t * rad_to_deg - beta));
        
        const involute_1_points = fn_parametric_points(x, y, 0, 0.68);
        const involute_2_points = fn_parametric_points(x2, y2, 0, 0.68);
        const points = [
            [0, 0],
            ...involute_1_points,
            ...fn_reverse(involute_2_points),
            [0, 0]
        ]

        return union(polygon(points));

        return difference(
            union(
                polygon(points)
            ),
            // Use subtraction to extend the invlute curve towards the base
            // circle and then stop it at that point. This will
            // add some square-shaped space at the base of the tooth
            // NOTE: usage of undercut might be overkill.
            circle({d: (dp - 2 * b)})
        );
    }

    // Create the gear by subtracting the teeth from a circle
    const gear = difference(
        circle({d: (dp + 2 * a)}),
        module_circular_mirror(0, 0, 0, N, involute_tooth())
    );

    // Combine with children if provided
    return children ? union(gear, children) : gear;
}

/**
 * Helper modules
 */
function module_circular_mirror(x = 0, y = 0, d, steps, children) {
    const aps = 360 / steps;
    const result = [];

    for (let step = 0; step < steps; step++) {
        const current_angle = step * aps;
        const unit_x = Math.cos(current_angle * deg_to_rad);
        const unit_y = Math.sin(current_angle * deg_to_rad);
        
        // In OpenSCAD, this would apply transforms to each child
        // In our JavaScript conversion, we simulate this by returning the transformed children
        result.push(
            translate([x, y, 0], 
                translate([unit_x * d, unit_y * d, 0], 
                    rotate([0, 0, current_angle], children)
                )
            )
        );
    }

    return union(...result);
}

/**
 * Helper function wrappers that convert between OpenSCAD style and Three.js style
 */
function circle({ d }) {
    return new Cylinder({ radius: d/2, height: 0.1 });
}

function polygon(points) {
    return new Polygon({ points });
}

function translate(xyz, object) {
    const [x, y, z] = xyz;
    const newObj = object;
    newObj.position = { x, y, z };
    return newObj;
}

function rotate(xyz, object) {
    const [x, y, z] = xyz;
    const newObj = object;
    newObj.rotation = { 
        x: x * deg_to_rad, 
        y: y * deg_to_rad, 
        z: z * deg_to_rad 
    };
    return newObj;
}

export {
    // Constants
    in_to_mm,
    rad_to_deg,
    deg_to_rad,
    
    // Functions
    fn_parametric_points,
    fn_reverse,
    
    // Math functions
    fn_calc_module,
    fn_calc_addendum,
    fn_calc_dedendum,
    fn_calc_dp,
    fn_calc_db,
    fn_calc_dr,
    fn_calc_circular_pitch,
    fn_calc_thickness,
    fn_calc_alpha,
    fn_calc_clearance,
    fn_calc_center_distance,
    
    // Modules
    module_spur_gear,
    module_circular_mirror,
    
    // Helper wrappers for OpenSCAD-like operations
    circle,
    polygon,
    union,
    difference,
    translate,
    rotate
};
