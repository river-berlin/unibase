export const placeObject = async (object_details: any, lmparams: any) => {
    const { objectId, x, y, z } = lmparams;
    // loop through the object_details and find the object with the given objectId
    // if it doesn't exist, throw an error
    const object = object_details.find((obj: any) => obj.objectId === objectId);
    if (!object) {
        throw new Error(`No object found with ID: ${objectId}`);
    }
    object.position = { x, y, z };
    return "placed object: " + JSON.stringify(object);
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
        additionalProperties: false,
        required: ['objectId', 'x', 'y', 'z']
    }
};

export const details = {
    declaration: placeObjectTool,
    function: placeObject
}