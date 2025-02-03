export const addCylinder = async (object_details: any, lmparams: any) => {
    const { radius, height, objectId = undefined } = lmparams;
    const id = objectId || ("object_" + (object_details.length + 1).toString());

    // Function that adds a cylinder at position 0,0,0 with specified radius and height
    const object = {
        type: 'cylinder',
        objectId: id,
        position: { x: 0, y: 0, z: 0 },
        radius,
        height,
        rotation: { x: 0, y: 0, z: 0 }
    };
    object_details.push(object);
    return object;
};

export const addCylinderTool = {
    name: 'add_cylinder',
    description: 'Adds a cylinder at the origin position (0,0,0) with specified radius and height',
    parameters: {
        type: 'object',
        properties: {
            radius: {
                type: 'number',
                description: 'Radius of the cylinder'
            },
            height: {
                type: 'number',
                description: 'Height of the cylinder'
            },
            objectId: {
                type: 'string',
                description: 'Optional custom ID for the cylinder. If not provided, one will be generated.',
            }
        },
        required: ['radius', 'height']
    }
};

export const declarationAndFunction = {
    declaration: addCylinderTool,
    function: addCylinder
} 