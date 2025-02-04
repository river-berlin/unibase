import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { writeFile, readFile, unlink } from 'fs/promises';
import os from 'os';

const execAsync = promisify(exec);

export interface BaseObject {
    objectId: string;
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        x: number;
        y: number;
        z: number;
    };
}

export interface CuboidObject extends BaseObject {
    type: 'cuboid';
    dimensions: {
        width: number;
        height: number;
        depth: number;
    };
}

export interface SphereObject extends BaseObject {
    type: 'sphere';
    radius: number;
}

export interface CylinderObject extends BaseObject {
    type: 'cylinder';
    radius: number;
    height: number;
}

export interface PolyhedronObject extends BaseObject {
    type: 'polyhedron';
    points: [number, number, number][];
    faces: number[][];
    convexity?: number;
}

export type ScadObject = CuboidObject | SphereObject | CylinderObject | PolyhedronObject;

/**
 * Converts a single cuboid object to OpenSCAD format
 */
function cuboidToScad(cuboid: CuboidObject): string {
    const { dimensions, position, rotation, objectId } = cuboid;
    return `// Object: ${objectId}
translate([${position.x}, ${position.y}, ${position.z}]) rotate([${rotation.x}, ${rotation.y}, ${rotation.z}]) cube([${dimensions.width}, ${dimensions.height}, ${dimensions.depth}], center=true);`;
}

/**
 * Converts a single sphere object to OpenSCAD format
 */
function sphereToScad(sphere: SphereObject): string {
    const { radius, position, rotation, objectId } = sphere;
    return `// Object: ${objectId}
translate([${position.x}, ${position.y}, ${position.z}]) rotate([${rotation.x}, ${rotation.y}, ${rotation.z}]) sphere(r=${radius}, $fn=64);`;
}

/**
 * Converts a single cylinder object to OpenSCAD format
 */
function cylinderToScad(cylinder: CylinderObject): string {
    const { radius, height, position, rotation, objectId } = cylinder;
    return `// Object: ${objectId}
translate([${position.x}, ${position.y}, ${position.z}]) rotate([${rotation.x}, ${rotation.y}, ${rotation.z}]) cylinder(r=${radius}, h=${height}, center=true, $fn=64);`;
}

/**
 * Converts a single polyhedron object to OpenSCAD format
 */
function polyhedronToScad(poly: PolyhedronObject): string {
    const { points, faces, position, rotation, convexity = 10, objectId } = poly;
    const pointsStr = points.map(p => `[${p.join(', ')}]`).join(',');
    const facesStr = faces.map(f => `[${f.join(', ')}]`).join(',');
    
    return `// Object: ${objectId}
translate([${position.x}, ${position.y}, ${position.z}]) rotate([${rotation.x}, ${rotation.y}, ${rotation.z}]) polyhedron(points = [${pointsStr}], faces = [${facesStr}], convexity = ${convexity});`;
}

/**
 * Converts an array of objects to OpenSCAD format
 */
export function jsonToScad(objects: ScadObject[]): string {
    const scadCode = objects.map(obj => {
        switch (obj.type) {
            case 'cuboid':
                return cuboidToScad(obj);
            case 'sphere':
                return sphereToScad(obj);
            case 'cylinder':
                return cylinderToScad(obj);
            case 'polyhedron':
                return polyhedronToScad(obj);
            default:
                throw new Error(`Unknown object type: ${(obj as any).type}`);
        }
    }).join('\n\n');
    return scadCode;
}

/**
 * Converts OpenSCAD text to ASCII STL using OpenSCAD CLI
 */
export async function scadToStl(scadCode: string): Promise<string> {
    if (!scadCode || scadCode.trim() === '') {
        // Return minimal valid STL for empty scene
        return `solid empty
endsolid empty`;
    }

    const tmpDir = os.tmpdir();
    const scadFile = path.join(tmpDir, `${Date.now()}.scad`);
    const stlFile = path.join(tmpDir, `${Date.now()}.stl`);

    try {
        // Write SCAD code to temporary file
        await writeFile(scadFile, scadCode);

        // Convert SCAD to STL using OpenSCAD CLI
        await execAsync(`openscad -o "${stlFile}" "${scadFile}" --export-format asciistl`);

        // Read the STL file
        const stlData = await readFile(stlFile, 'utf8');

        // Clean up temporary files
        await Promise.all([
            unlink(scadFile),
            unlink(stlFile)
        ]);

        return stlData;
    } catch (error) {
        // Clean up temporary files even if there's an error
        try {
            await Promise.all([
                unlink(scadFile),
                unlink(stlFile)
            ]);
        } catch {
            // Ignore cleanup errors
        }
        throw error;
    }
}
