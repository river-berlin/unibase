// LibFile: rounding.js
// This file provides functions for rounding edges and corners.

import { is_undef, is_list, is_num, is_bool, is_string, assert, is_vector } from '../../../compat/index.js';
import { EPSILON } from './math.js';
import { is_path, path_length, path_segment_length } from './paths.js';
import { unit, norm } from './vectors.js';

// Function: round_corners()
// Description: Rounds sharp corners of a path.
// Arguments:
//   path = The path to round corners on.
//   radius = The radius of the rounded corners.
//   closed = If true, treat the path as a closed polygon.
export function round_corners(path, radius, closed=false) {
    assert(is_path(path), "The 'path' parameter must be a valid path");
    assert(is_num(radius) && radius >= 0, "The 'radius' parameter must be a non-negative number");
    
    if (radius <= EPSILON) return path;
    
    const n = path.length;
    if (n < 3) return path;
    
    const result = [];
    
    for (let i = 0; i < n; i++) {
        const prev = (i + n - 1) % n;
        const curr = i;
        const next = (i + 1) % n;
        
        // Skip if this is the last point of an open path
        if (!closed && (i === 0 || i === n - 1)) {
            result.push(path[i]);
            continue;
        }
        
        // Get the vectors for the segments
        const v1 = [
            path[curr][0] - path[prev][0],
            path[curr][1] - path[prev][1],
            path.length > 2 ? (path[curr][2] - path[prev][2]) : 0
        ];
        
        const v2 = [
            path[next][0] - path[curr][0],
            path[next][1] - path[curr][1],
            path.length > 2 ? (path[next][2] - path[curr][2]) : 0
        ];
        
        // Calculate the lengths of the segments
        const len1 = norm(v1);
        const len2 = norm(v2);
        
        // Skip if segments are too short
        if (len1 < EPSILON || len2 < EPSILON) {
            result.push(path[i]);
            continue;
        }
        
        // Normalize the vectors
        const u1 = unit(v1);
        const u2 = unit(v2);
        
        // Calculate the angle between the segments
        const dot = u1[0] * u2[0] + u1[1] * u2[1] + (path.length > 2 ? u1[2] * u2[2] : 0);
        const angle = Math.acos(Math.min(Math.max(dot, -1), 1));
        
        // Skip if the angle is too small
        if (Math.abs(angle) < EPSILON || Math.abs(Math.PI - angle) < EPSILON) {
            result.push(path[i]);
            continue;
        }
        
        // Calculate the tangent distance
        const tan_dist = Math.min(radius / Math.tan(angle / 2), len1 / 2, len2 / 2);
        
        // Calculate the points for the rounded corner
        const p1 = [
            path[curr][0] - u1[0] * tan_dist,
            path[curr][1] - u1[1] * tan_dist,
            path.length > 2 ? (path[curr][2] - u1[2] * tan_dist) : 0
        ];
        
        const p2 = [
            path[curr][0] + u2[0] * tan_dist,
            path[curr][1] + u2[1] * tan_dist,
            path.length > 2 ? (path[curr][2] + u2[2] * tan_dist) : 0
        ];
        
        // Calculate the normal vector to the corner
        const normal = unit([
            u1[1] - u2[1],
            u2[0] - u1[0],
            0
        ]);
        
        // Calculate the center of the rounding arc
        const center = [
            path[curr][0] + normal[0] * radius / Math.sin(angle / 2),
            path[curr][1] + normal[1] * radius / Math.sin(angle / 2),
            path.length > 2 ? path[curr][2] : 0
        ];
        
        // Add the first point of the rounded corner
        result.push(p1);
        
        // Add intermediate points for the arc
        const steps = Math.max(1, Math.ceil(angle * radius / 0.1));
        for (let j = 1; j < steps; j++) {
            const t = j / steps;
            const a = angle * t;
            const rot_u1 = [
                u1[0] * Math.cos(a) - normal[0] * Math.sin(a),
                u1[1] * Math.cos(a) - normal[1] * Math.sin(a),
                path.length > 2 ? (u1[2] * Math.cos(a) - normal[2] * Math.sin(a)) : 0
            ];
            
            const pt = [
                center[0] - rot_u1[0] * radius / Math.sin(angle / 2),
                center[1] - rot_u1[1] * radius / Math.sin(angle / 2),
                path.length > 2 ? (center[2] - rot_u1[2] * radius / Math.sin(angle / 2)) : 0
            ];
            
            result.push(pt);
        }
        
        // Add the last point of the rounded corner
        result.push(p2);
    }
    
    return result;
}

// Function: fillet_path()
// Description: Fillets the corners of a 2D or 3D path.
// Arguments:
//   path = The path to fillet.
//   radius = The radius of the fillets.
//   closed = If true, treat the path as a closed polygon.
export function fillet_path(path, radius, closed=false) {
    return round_corners(path, radius, closed);
}

// Function: fillet_path_mask()
// Description: Creates a 2D mask for fillets at the corners of a path.
// Arguments:
//   path = The path to create fillets for.
//   radius = The radius of the fillets.
//   closed = If true, treat the path as a closed polygon.
//   chamfer = If true, create chamfers instead of fillets.
export function fillet_path_mask(path, radius, closed=false, chamfer=false) {
    assert(is_path(path, 2), "The 'path' parameter must be a valid 2D path");
    assert(is_num(radius) && radius >= 0, "The 'radius' parameter must be a non-negative number");
    
    if (radius <= EPSILON) return [];
    
    const n = path.length;
    if (n < 3) return [];
    
    const result = [];
    
    for (let i = 0; i < n; i++) {
        const prev = (i + n - 1) % n;
        const curr = i;
        const next = (i + 1) % n;
        
        // Skip if this is the last point of an open path
        if (!closed && (i === 0 || i === n - 1)) {
            continue;
        }
        
        // Get the vectors for the segments
        const v1 = [
            path[curr][0] - path[prev][0],
            path[curr][1] - path[prev][1]
        ];
        
        const v2 = [
            path[next][0] - path[curr][0],
            path[next][1] - path[curr][1]
        ];
        
        // Calculate the lengths of the segments
        const len1 = norm(v1);
        const len2 = norm(v2);
        
        // Skip if segments are too short
        if (len1 < EPSILON || len2 < EPSILON) {
            continue;
        }
        
        // Normalize the vectors
        const u1 = unit(v1);
        const u2 = unit(v2);
        
        // Calculate the angle between the segments
        const dot = u1[0] * u2[0] + u1[1] * u2[1];
        const angle = Math.acos(Math.min(Math.max(dot, -1), 1));
        
        // Skip if the angle is too small
        if (Math.abs(angle) < EPSILON || Math.abs(Math.PI - angle) < EPSILON) {
            continue;
        }
        
        // Calculate the tangent distance
        const tan_dist = Math.min(radius / Math.tan(angle / 2), len1 / 2, len2 / 2);
        
        // Calculate the points for the fillet
        const p1 = [
            path[curr][0] - u1[0] * tan_dist,
            path[curr][1] - u1[1] * tan_dist
        ];
        
        const p2 = [
            path[curr][0] + u2[0] * tan_dist,
            path[curr][1] + u2[1] * tan_dist
        ];
        
        if (chamfer) {
            // Create a triangle for the chamfer
            result.push([path[curr], p1, p2]);
        } else {
            // Calculate the normal vector to the corner
            const normal = unit([
                u1[1] - u2[1],
                u2[0] - u1[0]
            ]);
            
            // Calculate the center of the fillet arc
            const center = [
                path[curr][0] + normal[0] * radius / Math.sin(angle / 2),
                path[curr][1] + normal[1] * radius / Math.sin(angle / 2)
            ];
            
            // Create points for the fillet
            const arc_points = [p1];
            
            // Add intermediate points for the arc
            const steps = Math.max(1, Math.ceil(angle * radius / 0.1));
            for (let j = 1; j < steps; j++) {
                const t = j / steps;
                const a = angle * t;
                const rot_u1 = [
                    u1[0] * Math.cos(a) - normal[0] * Math.sin(a),
                    u1[1] * Math.cos(a) - normal[1] * Math.sin(a)
                ];
                
                const pt = [
                    center[0] - rot_u1[0] * radius / Math.sin(angle / 2),
                    center[1] - rot_u1[1] * radius / Math.sin(angle / 2)
                ];
                
                arc_points.push(pt);
            }
            
            arc_points.push(p2);
            arc_points.push(path[curr]);
            
            result.push(arc_points);
        }
    }
    
    return result;
}
