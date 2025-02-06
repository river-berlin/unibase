import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToolCallsProps {
  calls: {
    name: string;
    args: any;
    result?: any;
    error?: string;
  }[];
}

export function ToolCalls({ calls }: ToolCallsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!calls || calls.length === 0) return null;

  return (
    <View className="mt-2 border-l-2 border-blue-300 pl-2">
      <TouchableOpacity 
        className="flex-row items-center justify-between"
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text className="font-semibold text-xs text-gray-700">Actions</Text>
        <Ionicons 
          name={isExpanded ? 'chevron-down' : 'chevron-forward'} 
          size={16} 
          color="#4B5563"
        />
      </TouchableOpacity>
      
      {isExpanded && calls.map((call, i) => (
        <View key={i} className="mb-1">
          <Text className="font-medium text-xs">{call.name}</Text>
          <Text className="text-xs text-gray-600">
            {JSON.stringify(call.args, null, 2)}
          </Text>
          {call.error && (
            <Text className="text-xs text-red-500">{call.error}</Text>
          )}
        </View>
      ))}
    </View>
  );
} 