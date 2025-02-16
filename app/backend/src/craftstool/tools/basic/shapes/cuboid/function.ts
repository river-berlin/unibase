import { CuboidObject } from './types';

/**
 * Creates a new cuboid object and adds it to the scene
 * @param object_details - Array of existing objects in the scene
 * @param lmparams - Parameters for the new cuboid
 * @returns A string describing the added object
 */
export const func = async (object_details: any, lmparams: any) => {
    const { width, height, depth, objectId } = lmparams;

    const object: CuboidObject = {
        type: 'cuboid',
        objectId,
        position: { x: 0, y: 0, z: 0 },
        dimensions: { width, height, depth },
        rotation: { x: 0, y: 0, z: 0 }
    };

    const existingIndex = object_details.findIndex((obj: any) => obj.objectId === objectId);
    if (existingIndex !== -1) {
        object_details[existingIndex] = object;
        return `replaced cuboid with id ${objectId}: ${JSON.stringify(object)}`;
    } else {
        object_details.push(object);
        return `added new cuboid: ${JSON.stringify(object)}`;
    }
}; 