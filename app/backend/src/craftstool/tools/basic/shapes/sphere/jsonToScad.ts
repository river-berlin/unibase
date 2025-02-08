import { SphereObject } from './types';

/**
 * Converts a sphere object to OpenSCAD code
 * @param sphere - The sphere object to convert
 * @returns OpenSCAD code representing the sphere's geometry
 */
export function jsonToScad(sphere: SphereObject): string {
    const { radius, position, rotation } = sphere;
    return `translate([${position.x}, ${position.y}, ${position.z}]) rotate([${rotation.x}, ${rotation.y}, ${rotation.z}]) sphere(r=${radius}, $fn=64);`;
} 