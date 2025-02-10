import { getChatHistory, generateObjects, getProjectStl } from '../../../../../client/sdk.gen';
import { useState, useEffect } from 'react';

export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string | undefined;
  tool_calls: string | null;
  tool_outputs: string | null;
  object_id: string | null;
  created_at: string;
  error: string | null;
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

      if (response.data) {
        // Update messages
        setMessages([
          ...messages,
          {
            id: crypto.randomUUID(),
            role: 'user',
            content: instruction,
            tool_calls: null,
            tool_outputs: null,
            object_id: null,
            created_at: new Date().toISOString(),
            error: null
          },
          {
            id: response.data.messageId,
            role: 'assistant',
            content: response.data.reasoning,
            tool_calls: JSON.stringify(response.data.toolCalls),
            tool_outputs: JSON.stringify(response.data.json?.objects),
            object_id: null,
            created_at: new Date().toISOString(),
            error: response.data.errors ? JSON.stringify(response.data.errors) : null
          }
        ]);

        // Update STL
        onStlUpdate(response.data.stl);
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