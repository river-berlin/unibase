import { getChatHistory, generateObjects, getProjectStl, getProjectCode } from '../../../../../client/sdk.gen';
import { useState, useEffect } from 'react';
import { useAtom, getDefaultStore } from 'jotai';
import { 
  chatMessagesAtom, 
  stlDataAtom, 
  projectAtom,
  useCode,
  type Message,
} from '../../../../../app/atoms';

export {Message};

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentScad: string | null;
}

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
  instruction: string, 
  sceneImage: string
): Promise<void> {
  // Get the default Jotai store
  const store = getDefaultStore();
  
  // Get current values from atoms
  const project = store.get(projectAtom);
  const messages = store.get(chatMessagesAtom);
  
  if (!project) {
    console.error('No project selected');
    return;
  }
  
  if (!instruction.trim()) {
    console.error('Empty instruction');
    return;
  }
  
  try {
    // Call the API
    const response = await generateObjects({
      body: { 
        instructions: instruction,
        base64Image : sceneImage
      },
      path: { projectId: project.id }
    });
    
    if (response.data) {
      // Process messages if present
      if (response.data.messages) {
        const newMessages = response.data.messages.map((msg: any) => ({
          id: crypto.randomUUID(),
          role: msg.role || 'assistant',
          content: msg.content || '',
          tool_calls: msg.tool_calls || null,
          tool_outputs: msg.tool_outputs,
          object_id: msg.object_id || null,
          created_at: new Date().toISOString(),
          error: null
        }));
        
        // Add messages to global state
        store.set(chatMessagesAtom, [...messages, ...newMessages]);
      }
      
      // Update STL if present
      if (response.data.stl) {
        store.set(stlDataAtom, response.data.stl);
      }
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

export function useChatLogic(){
  // Local state for component usage
  const [,setMessages] = useState<Message[]>([]);
  
  // Global atoms
  const [, setGlobalMessages] = useAtom(chatMessagesAtom);
  const {code, setCode} = useCode();
  const [project] = useAtom(projectAtom);

  const fetchHistory = async () => {
    if(!project) return;

    const history = await getChatHistory({ path: { projectId : project.id } });
      
    // Update local state
    setMessages(history.data ?? []);
      
    // Update global atom
    setGlobalMessages(history.data ?? []);
  };

  const fetchCode = async () => {
    if(!project) return;

    console.log("got --- project code")

    try {
      const response = await getProjectCode({ path: { projectId : project.id } });
      if (response.data?.objects) {
        // Update global atom
        setCode(response.data.objects);
      }
    } catch (error) {
      console.error('Error fetching OpenSCAD code:', error);
    }
  };


  useEffect(() => {
    // Fetch history, initial STL, and OpenSCAD code when component mounts
    Promise.all([
      fetchHistory(),
      fetchCode()
    ]).catch(error => {
      console.error('Error during initial data fetch:', error);
    });

  }, [project]);

  return
} 