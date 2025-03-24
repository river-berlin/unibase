import { atom, useAtom } from 'jotai';

// Define the Message type here to avoid circular dependencies
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string | Array<any>;
  tool_calls: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }> | null;
  tool_outputs?: string;
  object_id: string | null;
  created_at: string;
  error: string | null;
}

/**
 * Atom for storing chat messages
 */
export const chatMessagesAtom = atom<Message[]>([]);

/**
 * Hook to get and set chat messages
 */
export function useChatMessages() {
  const [messages, setMessages] = useAtom(chatMessagesAtom);

  /**
   * Add a new message to the chat
   * @param message - Message to add
   */
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  /**
   * Add multiple messages to the chat
   * @param newMessages - Messages to add
   */
  const addMessages = (newMessages: Message[]) => {
    setMessages(prev => [...prev, ...newMessages]);
  };

  /**
   * Set all messages (replaces existing messages)
   * @param newMessages - Messages to set
   */
  const setAllMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
  };

  /**
   * Clear all messages
   */
  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    addMessage,
    addMessages,
    setAllMessages,
    clearMessages
  };
} 