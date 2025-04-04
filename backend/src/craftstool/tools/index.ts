import { details as filetool } from './filetool';
import { tool } from "ai";
import { ToolDetails } from './base';
// these are the most common tools that will be present by default
// in the future there will be a search function to find tools
// so more complex tools used

export const basicTools: ToolDetails[] = [
    filetool,
]

// Create AI SDK tools from declarations
export const aiSdkTools: Record<string, any> = {};

for (const _tool of basicTools) {
    // Use the name property from the details object or fall back to the declaration name
    const toolName = _tool.zodDeclaration.name;
    aiSdkTools[toolName] = tool({
        description: _tool.declaration.description,
        parameters: _tool.zodDeclaration.schema,
        execute: _tool.function
    });
}

export const basicToolDeclarations = basicTools.map((tool) => tool.declaration);