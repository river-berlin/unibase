import { CuboidObject } from './types';

/**
 * Creates a new cuboid object and adds it to the scene
 * @param object_details - Array of existing objects in the scene
 * @param lmparams - Parameters for the new cuboid
 * @returns A string describing the added object
 */
export const func = async (object_details: any, lmparams: any) => {
    const { width, height, depth, objectId = undefined } = lmparams;
    const id = objectId || ("object_" + (object_details.length + 1).toString());

    const object: CuboidObject = {
        type: 'cuboid',
        objectId: id,
        position: { x: 0, y: 0, z: 0 },
        dimensions: { width, height, depth },
        rotation: { x: 0, y: 0, z: 0 }
    };
    object_details.push(object);
    return "added cuboid: " + JSON.stringify(object);
}; 