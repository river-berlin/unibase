import { CuboidObject } from './types';

/**
 * Converts OpenSCAD code to a cuboid object
 * @param scadCode - The OpenSCAD code representing a single cuboid
 * @param meta - Metadata containing the object ID
 * @returns A CuboidObject representing the geometry
 * @throws {Error} If the SCAD code is not a valid cuboid
 */
export function scadToJson(scadCode: string, meta: { objectId: string }): CuboidObject {
    const regex = /translate\(\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]\)\s*rotate\(\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]\)\s*cube\(\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]\s*,\s*center=true\);/;
    
    const match = regex.exec(scadCode);
    if (!match) {
        throw new Error('Invalid cuboid SCAD code');
    }

    const [_, x, y, z, rx, ry, rz, width, height, depth] = match;
    return {
        type: "cuboid",
        objectId: meta.objectId,
        position: { x: Number(x), y: Number(y), z: Number(z) },
        rotation: { x: Number(rx), y: Number(ry), z: Number(rz) },
        dimensions: { width: Number(width), height: Number(height), depth: Number(depth) }
    };
} 