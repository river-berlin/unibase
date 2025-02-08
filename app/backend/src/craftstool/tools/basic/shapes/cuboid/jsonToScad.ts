import { CuboidObject } from './types';

/**
 * Converts a cuboid object to OpenSCAD code
 * @param cuboid - The cuboid object to convert
 * @returns OpenSCAD code representing the cuboid's geometry
 */
export function jsonToScad(cuboid: CuboidObject): string {
    const { dimensions, position, rotation } = cuboid;
    return `translate([${position.x}, ${position.y}, ${position.z}]) rotate([${rotation.x}, ${rotation.y}, ${rotation.z}]) cube([${dimensions.width}, ${dimensions.height}, ${dimensions.depth}], center=true);`;
} 