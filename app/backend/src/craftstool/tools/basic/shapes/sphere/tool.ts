/**
 * OpenAI function declaration for adding or replacing spheres
 */
export const tool = {
    name: 'add_sphere',
    description: 'Adds a new sphere or replaces an existing one at the origin position (0,0,0). If an object with the specified objectId exists, it will be replaced; otherwise, a new sphere will be added.',
    parameters: {
        type: 'object',
        properties: {
            radius: {
                type: 'number',
                description: 'Radius of the sphere'
            },
            objectId: {
                type: 'string',
                description: 'ID for the sphere. If an object with this ID already exists, it will be replaced. Must be unique if creating a new sphere.',
            }
        },
        additionalProperties: false,
        required: ['radius', 'objectId']
    }
}; 