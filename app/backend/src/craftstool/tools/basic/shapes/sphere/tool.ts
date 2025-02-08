/**
 * OpenAI function declaration for adding spheres
 */
export const tool = {
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