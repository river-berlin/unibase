import { getChatHistory, generateObjects, getProjectStl } from '../../../../../client/sdk.gen';
import { useState, useEffect } from 'react';

export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'tool';
  content: string | Array<any> | undefined;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
  object_id?: string | null;
  created_at?: string;
  error?: string | null;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface ChatActions {
  sendMessage: (instruction: string) => Promise<void>;
  fetchHistory: () => Promise<void>;
}

export function useChatLogic(
  projectId: string,
  onStlUpdate: (stl: string) => void
): [ChatState, ChatActions] {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      const history = await getChatHistory({ path: { projectId } });
      setMessages(history.data ?? []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const fetchInitialStl = async () => {
    try {
      const response = await getProjectStl({ path: { projectId } });
      if (response.data?.stl) {
        onStlUpdate(response.data.stl);
      }
    } catch (error) {
      console.error('Error fetching initial STL:', error);
    }
  };

  const sendMessage = async (instruction: string) => {
    if (!instruction.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await generateObjects({
        body: { instructions: instruction },
        path: { projectId }
      });

      console.log('response', response);

      if (response.data?.messages) {
        // Update with all messages from response
        setMessages(prevMessages => [
          ...prevMessages,
          ...response.data.messages.map(msg => ({
            id: crypto.randomUUID(),
            role: msg.role,
            content: msg.content,
            tool_calls: msg.tool_calls,
            tool_call_id: msg.tool_call_id,
            object_id: msg.object_id,
            created_at: new Date().toISOString(),
            error: null
          }))
        ]);

        // Update STL if present
        if (response.data.stl) {
          onStlUpdate(response.data.stl);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch both history and initial STL when component mounts
    Promise.all([
      fetchHistory(),
      fetchInitialStl()
    ]).catch(error => {
      console.error('Error during initial data fetch:', error);
    });
  }, [projectId]);

  return [
    { messages, isLoading },
    { sendMessage, fetchHistory }
  ];
} 