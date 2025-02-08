import { CylinderObject } from './types';

/**
 * Converts OpenSCAD code to a cylinder object
 * @param scadCode - The OpenSCAD code representing a single cylinder
 * @param meta - Metadata containing the object ID
 * @returns A CylinderObject representing the geometry
 * @throws {Error} If the SCAD code is not a valid cylinder
 */
export function scadToJson(scadCode: string, meta: { objectId: string }): CylinderObject {
    const regex = /translate\(\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]\)\s*rotate\(\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]\)\s*cylinder\(r=\s*(-?\d+\.?\d*)\s*,\s*h=\s*(-?\d+\.?\d*)\s*,\s*center=true\s*,\s*\$fn=\d+\s*\);/;
    
    const match = regex.exec(scadCode);
    if (!match) {
        throw new Error('Invalid cylinder SCAD code');
    }

    const [_, x, y, z, rx, ry, rz, radius, height] = match;
    return {
        type: "cylinder",
        objectId: meta.objectId,
        position: { x: Number(x), y: Number(y), z: Number(z) },
        rotation: { x: Number(rx), y: Number(ry), z: Number(rz) },
        radius: Number(radius),
        height: Number(height)
    };
} 