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
    return object;
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
                description: 'Optional custom ID for the sphere. If not provided, one will be generated.',
            }
        },
        required: ['radius']
    }
};

export const declarationAndFunction = {
    declaration: addSphereTool,
    function: addSphere
} 