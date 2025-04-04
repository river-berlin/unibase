import Objects from '../../database/models/objects';
import { z } from 'zod';
import { ToolFunction, ToolDeclaration, ZodToolDeclaration, ToolDetails } from './base';

/**
 * File operation parameters
 */
export type FileOperation = {
    type: 'edit' | 'create' | 'delete';
    objectId?: string;
    fileContent?: string;
    filename?: string;
    filepath?: string;
    projectId?: string;
    // For partial edits
    searchString?: string;
    replaceString?: string;
};

/**
 * File tool for managing JavaScript/ThreeJS files
 * 
 * This tool handles JavaScript code for ThreeJS rendering and 3D scene manipulation.
 * It supports creating new files, editing existing files (either fully or partially),
 * and deleting files.
 * 
 * @param lmparams Parameters from the LLM, including operation type and necessary data
 * @returns Object containing a result message
 */
export const filetool: ToolFunction<FileOperation> = async (lmparams) => {
    const operation: FileOperation = lmparams;
    
    try {
        switch (operation.type) {
            case 'edit': {
                if (!operation.objectId) {
                    return `Error: objectId is required to edit a file`;
                }

                const existingObject = await Objects.findById(operation.objectId);
                if (!existingObject) {
                    return `Error: Object with ID ${operation.objectId} not found`;
                }

                let newContent = operation.fileContent;
                
                // If doing a partial edit
                if (operation.searchString && operation.replaceString) {
                    newContent = existingObject.object.replace(
                        operation.searchString,
                        operation.replaceString
                    );
                }

                if (!newContent) {
                    return `Error: No content provided for edit operation`;
                }

                await Objects.updateObject(operation.objectId, {
                    object: newContent
                });

                return `Updated JavaScript/ThreeJS file content successfully for object ID: ${operation.objectId}`;
            }

            case 'create': {
                if (!operation.fileContent || !operation.filename || !operation.projectId) {
                    return `Error: fileContent, filename, and projectId are required to create a file`;
                }

                const newObject = await Objects.createObject({
                    object: operation.fileContent,
                    filename: operation.filename,
                    filepath: operation.filepath || `/project/${operation.projectId}/`,
                    project_id: operation.projectId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

                return `Created new JavaScript/ThreeJS file successfully with ID: ${newObject.id}`;
            }

            case 'delete': {
                if (!operation.objectId) {
                    return `Error: objectId is required to delete a file`;
                }

                const existingObject = await Objects.findById(operation.objectId);
                if (!existingObject) {
                    return `Error: Object with ID ${operation.objectId} not found`;
                }

                await Objects.deleteObject(operation.objectId);

                return `Deleted file successfully with ID: ${operation.objectId}`;
            }

            default:
                return `Error: Invalid operation type: ${operation.type}`;
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Error performing file operation: ${errorMessage}`;
    }
};

// Define the tool directly in Anthropic's format
export const declaration: ToolDeclaration = {
    name: 'fileModifier',
    description: 'Manages JavaScript/ThreeJS files with support for creating, editing (fully or partially), and deleting files',
    input_schema: {
        type: "object" as const,
        properties: {
            type: {
                type: 'string',
                enum: ['edit', 'create', 'delete'],
                description: 'The type of operation to perform'
            },
            objectId: {
                type: 'string',
                description: 'The ID of the object/file to edit or delete'
            },
            fileContent: {
                type: 'string',
                description: "New content for the JavaScript/ThreeJS file (required for create, optional for edit)"
            },
            filename: {
                type: 'string',
                description: "Name of the file (required for create)"
            },
            filepath: {
                type: 'string',
                description: "Path of the file (optional, defaults to /project/{projectId}/)"
            },
            projectId: {
                type: 'string',
                description: "ID of the project (required for create)"
            },
            searchString: {
                type: 'string',
                description: "String to search for in partial edit mode"
            },
            replaceString: {
                type: 'string',
                description: "String to replace with in partial edit mode"
            }
        },
        required: ['type']
    }
};

// Define the tool using Zod schema
export const zodDeclaration: ZodToolDeclaration = {
    name: 'fileModifier',
    description: 'Manages JavaScript/ThreeJS files with support for creating, editing (fully or partially), and deleting files',
    schema: z.object({
        type: z.enum(['edit', 'create', 'delete'], {
            description: 'The type of operation to perform'
        }),
        objectId: z.string({
            description: 'The ID of the object/file to edit or delete'
        }).optional(),
        fileContent: z.string({
            description: 'New content for the JavaScript/ThreeJS file (required for create, optional for edit)'
        }).optional(),
        filename: z.string({
            description: 'Name of the file (required for create)'
        }).optional(),
        filepath: z.string({
            description: 'Path of the file (optional, defaults to /project/{projectId}/)'
        }).optional(),
        projectId: z.string({
            description: 'ID of the project (required for create)'
        }).optional(),
        searchString: z.string({
            description: 'String to search for in partial edit mode'
        }).optional(),
        replaceString: z.string({
            description: 'String to replace with in partial edit mode'
        }).optional()
    }).refine(
        (data) => {
            if (data.type === 'edit' || data.type === 'delete') {
                return !!data.objectId;
            }
            if (data.type === 'create') {
                return !!data.fileContent && !!data.filename && !!data.projectId;
            }
            return true;
        },
        {
            message: 'Required fields missing for the specified operation type',
            path: ['type']
        }
    )
};

export const details: ToolDetails<FileOperation, typeof zodDeclaration.schema> = {
    declaration,
    zodDeclaration,
    function: filetool
};