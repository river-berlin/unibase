import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from './messages/Message';

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'tool';
  content: any; // Can be string or array of content blocks
  toolCalls?: Array<any>;
  toolCallId?: string;
  errors?: any;
  outputs?: string;
}

export function ChatMessage({ 
  role, 
  content, 
  toolCalls = [], 
  toolCallId, 
  errors, 
  outputs,
}: ChatMessageProps) {
  
  return (
    <View className="p-3 bg-white">
      <View className="flex-row items-center mb-2">
        <View className={`h-6 w-6 rounded-full border flex items-center justify-center ${
          role === 'assistant' ? 'bg-purple-100 border-purple-200' :
          role === 'tool' ? 'bg-green-100 border-green-200' :
          'bg-blue-100 border-blue-200'
        }`}>
          {role === 'assistant' && <Ionicons name="terminal-outline" size={14} color="#9333EA" />}
          {role === 'user' && <Ionicons name="person-outline" size={14} color="#000000" />}
          {role === 'tool' && <Ionicons name="construct-outline" size={14} color="#059669" />}
        </View>
        <Text className="ml-2 text-sm text-gray-700 font-medium">
          {role === 'assistant' ? 'Assistant' : 
           role === 'tool' ? `Tool: ${toolCallId}` : 
           'You'}
        </Text>
      </View>
      <View className={`p-2 rounded-lg ${
        role === 'assistant' ? 'bg-gray-100' :
        role === 'tool' ? 'bg-green-50 border border-green-200' :
        'bg-gray-50 border border-gray-200'
      }`}>
        {
          <>
            <Message title="Message" content={content} defaultExpanded={true} toolCalls={toolCalls} />
          </>
}
      </View>
    </View>
  );
} 