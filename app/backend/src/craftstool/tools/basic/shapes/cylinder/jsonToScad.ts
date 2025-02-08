import { CylinderObject } from './types';

/**
 * Converts a cylinder object to OpenSCAD code
 * @param cylinder - The cylinder object to convert
 * @returns OpenSCAD code representing the cylinder's geometry
 */
export function jsonToScad(cylinder: CylinderObject): string {
    const { radius, height, position, rotation } = cylinder;
    return `translate([${position.x}, ${position.y}, ${position.z}]) rotate([${rotation.x}, ${rotation.y}, ${rotation.z}]) cylinder(r=${radius}, h=${height}, center=true, $fn=64);`;
} 