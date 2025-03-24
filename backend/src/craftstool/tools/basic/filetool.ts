import { Tool } from '@anthropic-ai/sdk/resources/messages/messages';

export const filetool = async (existingScad: string, lmparams: any) => {
    const { fileContent } = lmparams;
    
    return {
        updatedContent: fileContent,
        result: `Updated file content`
    };
};

// Define the tool directly in Anthropic's format
export const declaration: Tool = {
    name: 'updateFileContent',
    description: 'Updates the OpenSCAD file content',
    input_schema: {
        type: "object" as const,
        properties: {
            fileContent: {
                type: 'string',
                description: 'New content for the OpenSCAD file'
            }
        },
        required: ['fileContent']
    }
};

export const details = {
    declaration,
    function: filetool
};