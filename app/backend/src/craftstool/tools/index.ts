import { details as cuboid } from './basic/shapes/cuboid';
import { details as sphere } from './basic/shapes/sphere';
import { details as cylinder } from './basic/shapes/cylinder';
import { details as placeObject } from './basic/place_object';
import { details as specifyRotation } from './basic/specify_rotation';
import { details as removeObject } from './basic/remove_object';

// these are the most common tools that will be present by default
// in the future there will be a search function to find tools
// so more complex tools used

export const basicTools = [
    cuboid,
    sphere,
    cylinder,
    placeObject,
    specifyRotation,
    removeObject
]

export const processTools = async (object_details: any, allToolCalls: any, declarationsAndFunctions: any) => {
    let toolCallResults: { originalToolCall: any; name: string; args: any; result?: any; error?: string; }[] = [];

    for (const toolCall of allToolCalls) {
        const { name, arguments: argsString } = toolCall.function;
        const args = JSON.parse(argsString);
        const tool = declarationsAndFunctions.find((tool: any) => tool.declaration.name === name);
  
        if (tool) {
          try {
            const result = await tool.function(object_details, args);
            toolCallResults.push({ originalToolCall: toolCall, name, args, result });
          } catch (error) {
            const errorMsg = `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`;
            toolCallResults.push({ originalToolCall: toolCall, name, args, error: errorMsg });
          }
        } else {
          const errorMsg = `Unknown tool: ${name}`;
          toolCallResults.push({ originalToolCall: toolCall, name, args, error: errorMsg });
        }
      }

    return toolCallResults;
}