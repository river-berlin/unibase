export const specifyRotation = async (object_details: any, lmparams: any) => {
    const { objectId, x, y, z } = lmparams;
    // loop through the object_details and find the object with the given objectId
    const object = object_details.find((obj: any) => obj.objectId === objectId);
    object.rotation = { x, y, z };
    return "rotated object: " + JSON.stringify(object);
};

export const specifyRotationTool = {
    name: 'specify_rotation',
    description: 'Sets the rotation of an object using x, y, z angles in degrees',
    parameters: {
        type: 'object',
        properties: {
            objectId: {
                type: 'string',
                description: 'ID of the object to rotate'
            },
            x: {
                type: 'number',
                description: 'X-axis rotation in degrees'
            },
            y: {
                type: 'number',
                description: 'Y-axis rotation in degrees'
            },
            z: {
                type: 'number',
                description: 'Z-axis rotation in degrees'
            }
        },
        additionalProperties: false,
        required: ['objectId', 'x', 'y', 'z']
    }
};

export const details = {
    declaration: specifyRotationTool,
    function: specifyRotation
}