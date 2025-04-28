// LibFile: attachments.js
// This file provides functions for attaching objects together in various ways.
// It allows for positioning objects relative to each other using anchor points.

import { is_undef, is_list, is_string, assert, is_vector } from '../../../compat/index.js';
import { _NO_ARG } from './transforms.js';
import { CENTER, LEFT, RIGHT, TOP, BOTTOM, FRONT, BACK } from './constants.js';
import { move, rot } from './transforms.js';

// Helper function to compare arrays for equality
function arraysEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    
    return true;
}

// Named constants for anchor types
export const ANCHOR_TYPES = {
    EDGE: "edge",
    FACE: "face",
    CORNER: "corner",
    CYLINDER: "cylinder",
    SPHERE: "sphere",
    CUBE: "cube"
};

// Function: is_anchor()
// Description: Returns true if x is an anchor specifier.
// Arguments:
//   x = The value to check.
export function is_anchor(x) {
    return is_string(x) || is_vector(x, 3) || is_list(x);
}

// Function: get_anchor_normal()
// Description: Returns the unit normal vector for the given anchor.
// Arguments:
//   anchor = The anchor to get the normal of.
export function get_anchor_normal(anchor) {
    if (is_string(anchor)) {
        if (anchor === CENTER) return [0, 0, 0];
        if (anchor === LEFT) return [-1, 0, 0];
        if (anchor === RIGHT) return [1, 0, 0];
        if (anchor === FRONT) return [0, -1, 0];
        if (anchor === BACK) return [0, 1, 0];
        if (anchor === BOTTOM) return [0, 0, -1];
        if (anchor === TOP) return [0, 0, 1];
        
        // Handle compound anchors like "top+left"
        const parts = anchor.split("+");
        if (parts.length > 1) {
            const normals = parts.map(p => get_anchor_normal(p));
            const sum = normals.reduce((acc, n) => [acc[0] + n[0], acc[1] + n[1], acc[2] + n[2]], [0, 0, 0]);
            const len = Math.sqrt(sum[0]*sum[0] + sum[1]*sum[1] + sum[2]*sum[2]);
            return len > 0 ? [sum[0]/len, sum[1]/len, sum[2]/len] : [0, 0, 0];
        }
    } else if (is_vector(anchor, 3)) {
        // If anchor is a vector, normalize it
        const len = Math.sqrt(anchor[0]*anchor[0] + anchor[1]*anchor[1] + anchor[2]*anchor[2]);
        return len > 0 ? [anchor[0]/len, anchor[1]/len, anchor[2]/len] : [0, 0, 0];
    }
    
    // Default case
    return [0, 0, 0];
}

// Function: get_anchor_position()
// Description: Returns the position of the given anchor on the specified shape.
// Arguments:
//   shape = The shape to get the anchor position for.
//   anchor = The anchor to get the position of.
export function get_anchor_position(shape, anchor) {
    if (!shape || !shape.size) return [0, 0, 0];
    
    const size = shape.size;
    const w = size[0] || 0;
    const h = size[1] || 0;
    const d = size[2] || 0;
    
    if (is_string(anchor)) {
        if (anchor === CENTER) return [0, 0, 0];
        if (anchor === LEFT) return [-w/2, 0, 0];
        if (anchor === RIGHT) return [w/2, 0, 0];
        if (anchor === FRONT) return [0, -h/2, 0];
        if (anchor === BACK) return [0, h/2, 0];
        if (anchor === BOTTOM) return [0, 0, -d/2];
        if (anchor === TOP) return [0, 0, d/2];
        
        // Handle compound anchors like "top+left"
        const parts = anchor.split("+");
        if (parts.length > 1) {
            return parts.map(p => get_anchor_position(shape, p))
                .reduce((acc, pos) => [acc[0] + pos[0], acc[1] + pos[1], acc[2] + pos[2]], [0, 0, 0]);
        }
    } else if (is_vector(anchor, 3)) {
        // If anchor is a vector, use it as a relative position
        return [
            anchor[0] * w/2,
            anchor[1] * h/2,
            anchor[2] * d/2
        ];
    }
    
    // Default case
    return [0, 0, 0];
}

// Function: reorient()
// Description: Reorients an object based on anchor, spin, and orient parameters.
// Arguments:
//   anchor = The anchor point to align to.
//   spin = Rotation in degrees around the Z axis.
//   orient = The orientation of the object.
//   p = The object to reorient.
export function reorient(anchor, spin, orient, p) {
    if (is_undef(p)) {
        return function(shape) {
            return reorient(anchor, spin, orient, shape);
        };
    }
    
    // Apply anchor
    let result = p;
    if (!is_undef(anchor) && anchor !== CENTER) {
        const pos = get_anchor_position(p, anchor);
        result = move([-pos[0], -pos[1], -pos[2]], result);
    }
    
    // Apply spin
    if (!is_undef(spin) && spin !== 0) {
        result = rot([0, 0, spin], result);
    }
    
    // Apply orient
    if (!is_undef(orient) && !arraysEqual(orient, [0, 0, 1])) {
        // This would need a more complex implementation with quaternions
        // For now, we'll just handle simple cases
        if (arraysEqual(orient, [1, 0, 0])) {
            result = rot([0, 90, 0], result);
        } else if (arraysEqual(orient, [0, 1, 0])) {
            result = rot([90, 0, 0], result);
        } else if (arraysEqual(orient, [-1, 0, 0])) {
            result = rot([0, -90, 0], result);
        } else if (arraysEqual(orient, [0, -1, 0])) {
            result = rot([-90, 0, 0], result);
        } else if (arraysEqual(orient, [0, 0, -1])) {
            result = rot([180, 0, 0], result);
        }
    }
    
    return result;
}

// Function: attach()
// Description: Attaches one object to another at specific anchor points.
// Arguments:
//   to = The anchor on the target object to attach to.
//   from = The anchor on the source object to attach from.
//   p = The object to attach.
export function attach(to, from, p) {
    if (is_undef(p)) {
        return function(shape) {
            return attach(to, from, shape);
        };
    }
    
    assert(is_anchor(to), "The 'to' parameter must be an anchor");
    assert(is_anchor(from), "The 'from' parameter must be an anchor");
    
    const to_normal = get_anchor_normal(to);
    const from_normal = get_anchor_normal(from);
    
    // Calculate the rotation needed to align the anchors
    // This would need a more complex implementation with quaternions
    // For now, we'll just handle simple cases
    let rotation = [0, 0, 0];
    
    // Move the object to align the anchors
    const to_pos = get_anchor_position(p, to);
    const from_pos = get_anchor_position(p, from);
    const offset = [
        to_pos[0] - from_pos[0],
        to_pos[1] - from_pos[1],
        to_pos[2] - from_pos[2]
    ];
    
    let result = p;
    result = rot(rotation, result);
    result = move(offset, result);
    
    return result;
}

// Function: position()
// Description: Moves an object to a position based on the given anchor.
// Arguments:
//   anchor = The anchor to position at.
//   p = The object to position.
export function position(anchor, p) {
    if (is_undef(p)) {
        return function(shape) {
            return position(anchor, shape);
        };
    }
    
    assert(is_anchor(anchor), "The 'anchor' parameter must be an anchor");
    
    const pos = get_anchor_position(p, anchor);
    return move([-pos[0], -pos[1], -pos[2]], p);
}

