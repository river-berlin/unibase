import { SphereObject } from './types';

/**
 * Creates a new sphere object and adds it to the scene
 * @param object_details - Array of existing objects in the scene
 * @param lmparams - Parameters for the new sphere
 * @returns A string describing the added object
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
    object_details.push(object);
    return "added sphere: " + JSON.stringify(object);
}; 