import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ToolCalls } from './messages/ToolCalls';
import { Errors } from './messages/Errors';
import { ToolOutputs } from './messages/ToolOutputs';
import { Reasoning } from './messages/Reasoning';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: {
    name: string;
    args: any;
    result?: any;
    error?: string;
  }[];
  errors?: string[];
  outputs?: string;
}

export function ChatMessage({ role, content, toolCalls, errors, outputs }: ChatMessageProps) {
  const isAssistant = role === 'assistant';

  return (
    <View className="p-3 bg-white">
      <View className="flex-row items-center mb-2">
        <View className={`h-6 w-6 rounded-full border flex items-center justify-center ${
          isAssistant 
            ? 'bg-purple-100 border-purple-200' 
            : 'bg-blue-100 border-blue-200'
        }`}>
          {isAssistant && (
            <Ionicons name="terminal-outline" size={14} color="#9333EA" />
          )}
          {!isAssistant && (
            <Ionicons name="person-outline" size={14} color="#000000" />
          )}
        </View>
        <Text className="ml-2 text-sm text-gray-700 font-medium">
          {isAssistant ? 'Assistant' : 'You'}
        </Text>
      </View>
      <View 
        className={`p-2 rounded-lg ${
          isAssistant 
            ? 'bg-gray-100' 
            : 'bg-gray-50 border border-gray-200'
        }`}
      >
        {isAssistant ? (
          <>
            <Reasoning title="Message" content={content} defaultExpanded={false} />
            {toolCalls && <ToolCalls calls={toolCalls} />}
            {errors && <Errors errors={errors} />}
            {outputs && <ToolOutputs outputs={outputs} />}
          </>
        ) : (
          <Text className="text-sm text-gray-800">{content}</Text>
        )}
      </View>
    </View>
  );
} 