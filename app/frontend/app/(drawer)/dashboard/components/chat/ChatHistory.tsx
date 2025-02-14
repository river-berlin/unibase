import React from 'react';
import { ScrollView, View } from 'react-native';
import { ChatMessage } from './ChatMessage';

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

interface ChatHistoryProps {
  messages: Message[];
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="pb-4">
        {messages.toReversed().map((message) => {
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