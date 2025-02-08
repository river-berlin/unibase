export const removeObject = async (object_details: any, lmparams: any) => {
    const { objectId } = lmparams;
    // Find the index of the object with the specified ID
    const index = object_details.findIndex((obj: any) => obj.objectId === objectId);
    
    if (index === -1) {
        throw new Error(`No object found with ID: ${objectId}`);
    }

    // Remove the object from the array
    const removedObject = object_details.splice(index, 1)[0];
    return "removed object: " + JSON.stringify(removedObject);
};

export const removeObjectTool = {
    name: 'remove_object',
    description: 'Removes an object from the scene by its ID',
    parameters: {
        type: 'object',
        properties: {
            objectId: {
                type: 'string',
                description: 'ID of the object to remove'
            }
        },
        additionalProperties: false,
        required: ['objectId']
    }
};

export const details = {
    declaration: removeObjectTool,
    function: removeObject
} 