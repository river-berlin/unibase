import { CylinderObject } from './types';

/**
 * Creates a new cylinder object and adds it to the scene
 * @param object_details - Array of existing objects in the scene
 * @param lmparams - Parameters for the new cylinder
 * @returns A string describing the added object
 */
export const func = async (object_details: any, lmparams: any) => {
    const { radius, height, objectId = undefined } = lmparams;
    const id = objectId || ("object_" + (object_details.length + 1).toString());

    const object: CylinderObject = {
        type: 'cylinder',
        objectId: id,
        position: { x: 0, y: 0, z: 0 },
        radius,
        height,
        rotation: { x: 0, y: 0, z: 0 }
    };
    object_details.push(object);
    return "added cylinder: " + JSON.stringify(object);
}; 