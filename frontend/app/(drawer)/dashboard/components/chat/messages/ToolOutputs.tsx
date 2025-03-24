import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToolOutputsProps {
  outputs: string;
}

export function ToolOutputs({ outputs }: ToolOutputsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!outputs) return null;

  return (
    <View className="mt-2 border-l-2 border-gray-300 pl-2">
      <TouchableOpacity 
        className="flex-row items-center justify-between"
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text className="font-semibold text-xs text-gray-700">Generated Objects</Text>
        <Ionicons 
          name={isExpanded ? 'chevron-down' : 'chevron-forward'} 
          size={16} 
          color="#4B5563"
        />
      </TouchableOpacity>

      {isExpanded && (
        <Text className="font-mono text-xs text-gray-600">{outputs}</Text>
      )}
    </View>
  );
} 