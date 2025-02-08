import { SphereObject } from './types';

/**
 * Converts OpenSCAD code to a sphere object
 * @param scadCode - The OpenSCAD code representing a single sphere
 * @param meta - Metadata containing the object ID
 * @returns A SphereObject representing the geometry
 * @throws {Error} If the SCAD code is not a valid sphere
 */
export function scadToJson(scadCode: string, meta: { objectId: string }): SphereObject {
    const regex = /translate\(\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]\)\s*rotate\(\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]\)\s*sphere\(r=\s*(-?\d+\.?\d*)\s*,\s*\$fn=\d+\s*\);/;
    
    const match = regex.exec(scadCode);
    if (!match) {
        throw new Error('Invalid sphere SCAD code');
    }

    const [_, x, y, z, rx, ry, rz, radius] = match;
    return {
        type: "sphere",
        objectId: meta.objectId,
        position: { x: Number(x), y: Number(y), z: Number(z) },
        rotation: { x: Number(rx), y: Number(ry), z: Number(rz) },
        radius: Number(radius)
    };
} 