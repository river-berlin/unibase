export const placeObject = async (object_details: any, lmparams: any) => {
    const { objectId, x, y, z } = lmparams;
    // loop through the object_details and find the object with the given objectId
    const object = object_details.find((obj: any) => obj.objectId === objectId);
    object.position = { x, y, z };
    return object;
};

export const placeObjectTool = {
    name: 'place_object',
    description: 'Places an object at the specified x, y, z coordinates',
    parameters: {
        type: 'object',
        properties: {
            objectId: {
                type: 'string',
                description: 'ID of the object to place'
            },
            x: {
                type: 'number',
                description: 'X coordinate for object placement'
            },
            y: {
                type: 'number',
                description: 'Y coordinate for object placement'
            },
            z: {
                type: 'number',
                description: 'Z coordinate for object placement'
            }
        },
        required: ['objectId', 'x', 'y', 'z']
    }
};

export const declarationAndFunction = {
    declaration: placeObjectTool,
    function: placeObject
}