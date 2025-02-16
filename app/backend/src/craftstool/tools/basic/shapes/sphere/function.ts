import { SphereObject } from './types';

/**
 * Creates a new sphere object or replaces an existing one in the scene
 * @param object_details - Array of existing objects in the scene
 * @param lmparams - Parameters for the sphere
 * @returns A string describing the added or replaced object
 */
export const func = async (object_details: any, lmparams: any) => {
    const { radius, objectId = undefined } = lmparams;
    const id = objectId || ("object_" + (object_details.length + 1).toString());

    const object: SphereObject = {
        type: 'sphere',
        objectId: id,
        position: { x: 0, y: 0, z: 0 },
        radius,
        rotation: { x: 0, y: 0, z: 0 }
    };

    // Find existing object index
    const existingIndex = object_details.findIndex((obj: any) => obj.objectId === id);
    
    if (existingIndex !== -1) {
        // Replace existing object
        object_details[existingIndex] = object;
        return "replaced sphere: " + JSON.stringify(object);
    } else {
        // Add new object
        object_details.push(object);
        return "added sphere: " + JSON.stringify(object);
    }
}; 