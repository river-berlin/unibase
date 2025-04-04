import React from 'react';
import { ScrollView, View } from 'react-native';
import { ChatMessage } from './ChatMessage';
import { useChatMessages } from "~/app/atoms"

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tool_calls: any[] | null;
  tool_outputs: string | undefined;
  object_id: string | null;
  created_at: string;
  error: string | null;
}

export function ChatHistory() {
  const { messages } = useChatMessages();

  // Convert atom messages to the expected Message format
  const formattedMessages = messages.map(msg => ({
    id: msg.id,
    role: msg.role === 'tool' ? 'assistant' : msg.role, // Map 'tool' role to 'assistant'
    content: msg.content,
    tool_calls: msg.tool_calls,
    tool_outputs: msg.tool_outputs,
    object_id: msg.object_id,
    created_at: msg.created_at,
    error: msg.error
  } as Message));

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="pb-4">
        {formattedMessages.toReversed().map((message) => {
          return <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            toolCalls={message.tool_calls ? message.tool_calls : undefined}
            errors={message.error ? JSON.parse(message.error) : undefined}
            outputs={message.tool_outputs}
          />
        })}
      </View>
    </ScrollView>
  );
} 