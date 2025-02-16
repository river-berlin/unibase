/**
 * OpenAI function declaration for adding cuboids
 */
export const tool = {
    name: 'add_or_replace_cuboid',
    description: 'Adds a new cuboid or replaces an existing one if objectId matches. Places at origin position (0,0,0) with specified dimensions',
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
                description: 'ID for the cuboid. If an object with this ID exists, it will be replaced',
            }
        },
        additionalProperties: false,
        required: ['width', 'height', 'depth', 'objectId']
    }
}; 