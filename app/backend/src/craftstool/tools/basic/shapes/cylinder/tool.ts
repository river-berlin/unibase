/**
 * OpenAI function declaration for adding or replacing cylinders
 */
export const tool = {
    name: 'add_or_replace_cylinder',
    description: 'Adds a new cylinder or replaces an existing one at the origin position (0,0,0). If an object with the specified objectId exists, it will be replaced; otherwise, a new cylinder will be added.',
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
                description: 'ID for the cylinder. If an object with this ID already exists, it will be replaced. Must be unique if creating a new cylinder.',
            }
        },
        additionalProperties: false,
        required: ['radius', 'height', 'objectId']
    }
}; 