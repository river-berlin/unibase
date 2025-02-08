/**
 * OpenAI function declaration for adding cylinders
 */
export const tool = {
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
                description: 'ID for the cylinder. This must be unique, something creative and super unique',
            }
        },
        additionalProperties: false,
        required: ['radius', 'height', 'objectId']
    }
}; 