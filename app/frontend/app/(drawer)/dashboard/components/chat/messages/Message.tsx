import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ToolCalls } from './ToolCalls'; 
interface ReasoningProps {
  title: string;
  content: string;
  defaultExpanded?: boolean;
  toolCalls: Array<any>;
}

export function Message({ title, content, defaultExpanded = true, toolCalls }: ReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!content) return null;

  return (
    <View className="border-l-2 border-gray-300 pl-2">
      <TouchableOpacity 
        className="flex-row items-center justify-between"
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text className="font-semibold text-xs text-gray-700">{title}</Text>
        <Ionicons 
          name={isExpanded ? 'chevron-down' : 'chevron-forward'} 
          size={16} 
          color="#4B5563"
        />
      </TouchableOpacity>

      {isExpanded && (
        <Text className="text-xs text-gray-600">{content}</Text>
      )}

      <ToolCalls functions={toolCalls} />

    </View>
  );
}