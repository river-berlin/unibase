import { details as filetool } from './basic/filetool';
import { ContentBlockParam, ToolUseBlockParam, MessageParam } from '@anthropic-ai/sdk/resources/messages/messages';

// these are the most common tools that will be present by default
// in the future there will be a search function to find tools
// so more complex tools used

export const basicTools = [
    filetool,
]

export const basicToolDeclarations = basicTools.map((tool) => tool.declaration);

interface ProcessToolsResult {
    toolResultMessages: MessageParam[];
    newScad: string;
}


const createToolResultMessage = (toolUseId: string, result: any): MessageParam => {
    return {
        role: 'user', 
        content: [{
            type: 'tool_result', 
            tool_use_id: toolUseId, 
            content: typeof result === 'string' ? result : JSON.stringify(result)
        }]
    };
}

const processTool = async (
    scad: string, 
    toolUseBlock: ToolUseBlockParam, 
    declarationsAndFunctions: Array<any>
): Promise<{newScad: string, toolResultMessage: MessageParam}> => {
    const { id, name, input } = toolUseBlock;
    const tool = declarationsAndFunctions.find((tool: any) => tool.declaration.name === name);
    
    if (tool) {
        try {
            let {updatedContent, result} = await tool.function(scad, input);
            return {
                newScad: updatedContent, 
                toolResultMessage: createToolResultMessage(id, result)
            };
        } catch (error) {
            const errorMsg = `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`;
            return {
                newScad: scad, 
                toolResultMessage: createToolResultMessage(id, errorMsg)
            };
        }
    } else {
        return {
            newScad: scad, 
            toolResultMessage: createToolResultMessage(id, `Unknown tool: ${name}`)
        };
    }
}

export const processTools = async (
    scad: string, 
    toolUseBlocks: ToolUseBlockParam[], 
    declarationsAndFunctions: Array<any>
): Promise<ProcessToolsResult> => {
    let toolResultMessages: MessageParam[] = [];
    let newScad = scad;
    
    for (const toolUseBlock of toolUseBlocks) {
        const response = await processTool(newScad, toolUseBlock, declarationsAndFunctions);
        toolResultMessages.push(response.toolResultMessage);
        newScad = response.newScad;
    }

    return {
        toolResultMessages,
        newScad
    };
}

// Helper function to extract tool_use blocks from Claude's response
export const extractToolUseBlocks = (content: string | ContentBlockParam[]): ContentBlockParam[] => {
    if (typeof content === 'string') {
        return [];
    }
    return content.filter(block => block.type === 'tool_use');
}