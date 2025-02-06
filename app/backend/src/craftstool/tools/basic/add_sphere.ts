export const addSphere = async (object_details: any, lmparams: any) => {
    const { radius, objectId = undefined } = lmparams;
    const id = objectId || ("object_" + (object_details.length + 1).toString());

    // Function that adds a sphere at position 0,0,0 with specified radius
    const object = {
        type: 'sphere',
        objectId: id,
        position: { x: 0, y: 0, z: 0 },
        radius,
        rotation: { x: 0, y: 0, z: 0 }
    };
    object_details.push(object);
    return "added sphere: " + JSON.stringify(object);
};

export const addSphereTool = {
    name: 'add_sphere',
    description: 'Adds a sphere at the origin position (0,0,0) with specified radius',
    parameters: {
        type: 'object',
        properties: {
            radius: {
                type: 'number',
                description: 'Radius of the sphere'
            },
            objectId: {
                type: 'string',
                description: 'ID for the sphere. This must be unique, something creative and super unique',
            }
        },
        additionalProperties: false,
        required: ['radius', 'objectId']
    }
};

export const declarationAndFunction = {
    declaration: addSphereTool,
    function: addSphere
} 