import { CuboidObject, jsonToScad as cuboidToScad } from './tools/basic/shapes/cuboid';
import { SphereObject, jsonToScad as sphereToScad } from './tools/basic/shapes/sphere';
import { CylinderObject, jsonToScad as cylinderToScad } from './tools/basic/shapes/cylinder';

export type ScadObject = CuboidObject | SphereObject | CylinderObject;

/**
 * Converts an array of objects to OpenSCAD format
 */
export function jsonToScad(objects: ScadObject[]): string {
    const scadCode = objects.map(obj => {
        // Add comment for object ID
        const comment = `// Object: ${obj.objectId}\n`;
        
        switch (obj.type) {
            case 'cuboid':
                return comment + cuboidToScad(obj);
            case 'sphere':
                return comment + sphereToScad(obj);
            case 'cylinder':
                return comment + cylinderToScad(obj);
            default:
                throw new Error(`Unknown object type: ${(obj as any).type}`);
        }
    }).join('\n\n');
    return scadCode;
} 