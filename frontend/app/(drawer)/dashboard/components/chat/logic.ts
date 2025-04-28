import { getChatHistory, generateObjects, getProjectCode } from '../../../../../client/sdk.gen';
import { 
  type Message,
} from '~/app/atoms';

import { NonNullableCodeObjects } from '~/app/atoms/code';

export {Message};

export interface ChatActions {
  fetchHistory: () => Promise<void>;
  fetchScad: () => Promise<void>;
}

/**
 * Standalone function to send a message using atoms directly
 * @param instruction - The instruction/message to send
 * @param sceneImageReference - Reference to the scene image
 * @returns Promise that resolves when the message is processed
 */
export async function sendMessage(
  projectId: string,
  instruction: string, 
  sceneImage: string
): Promise<Message[]> {
  
  if (!instruction.trim()) {
    console.error('Empty instruction');
    return [];
  }
  
// Call the API
const response = await generateObjects({
  body: { 
    instructions: instruction,
    base64Image : sceneImage
    },
    path: { projectId }
  });
  
  let newMessages: Message[] = [];

  console.log("-- x -- response", response);
  
  if (response.data) {
    // Process messages if present
    if (response.data.messages) {
      newMessages = response.data.messages.map((msg: any) => ({
        id: crypto.randomUUID(),
        role: msg.role || 'assistant',
        content: msg.content || '',
        tool_calls: msg.tool_calls || null,
        tool_outputs: msg.tool_outputs,
        created_at: new Date().toISOString(),
        error: null
      }));
    }
  }

  console.log("-- x -- newMessages", newMessages);

  return newMessages;
}

export const fetchHistory = async (projectId: string) : Promise<Message[]> => {
  const history = await getChatHistory({ path: { projectId } });
  return history.data ?? [];
};

export const fetchCode = async (projectId: string) : Promise<NonNullableCodeObjects> => {
  let code: NonNullableCodeObjects = [];

  try {
    const response = await getProjectCode({ path: { projectId } });
    if (response.data?.objects) {
      code = response.data.objects;
    }
  } catch (error) {
    console.error('Error fetching OpenSCAD code:', error);
  }

  return code;
};