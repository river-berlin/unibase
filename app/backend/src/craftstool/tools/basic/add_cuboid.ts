export const addCuboid = async (object_details: any, lmparams: any) => {
    const { width, height, depth, objectId = undefined } = lmparams;
    const id = objectId || ("object_" + (object_details.length + 1).toString());

    // Function that adds a cuboid at position 0,0,0 with specified dimensions
    const object = {
        type: 'cuboid',
        objectId: id,
        position: { x: 0, y: 0, z: 0 },
        dimensions: { width, height, depth },
        rotation: { x: 0, y: 0, z: 0 }
    };
    object_details.push(object);
    return "added cuboid: " + JSON.stringify(object);
};

export const addCuboidTool = {
    name: 'add_cuboid',
    description: 'Adds a cuboid at the origin position (0,0,0) with specified dimensions',
    parameters: {
        type: 'object',
        properties: {
            width: {
                type: 'number',
                description: 'Width of the cuboid (X dimension)'
            },
            height: {
                type: 'number',
                description: 'Height of the cuboid (Y dimension)'
            },
            depth: {
                type: 'number',
                description: 'Depth of the cuboid (Z dimension)'
            },
            objectId: {
                type: 'string',
                description: 'ID for the cuboid. This must be unique, something creative and super unique',
            }
        },
        additionalProperties: false,
        required: ['width', 'height', 'depth', 'objectId']
    }
};

export const declarationAndFunction = {
    declaration: addCuboidTool,
    function: addCuboid
}