import { atom, useAtom } from 'jotai';
import { GetChatHistoryResponses } from '../../client/types.gen';

// Define the Message type from the chat history response array element type
export type Message = GetChatHistoryResponses['200'][number];

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