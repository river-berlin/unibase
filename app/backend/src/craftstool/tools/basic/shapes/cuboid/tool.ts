/**
 * OpenAI function declaration for adding cuboids
 */
export const tool = {
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