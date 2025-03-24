import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToolCallsProps {
  functions: {
    name: string;
    arguments: any;
  }[];
}

export function ToolCalls({functions=[]} : ToolCallsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (functions.length === 0) return null;

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
      
      {isExpanded && functions.map((_function : any, _i : any) => (
        <View key={_i} className="mb-1">
          <Text className="font-medium text-xs">{_function.function.name}</Text>
          <Text className="text-xs text-gray-600 ml-2">
            {Object.entries(JSON.parse(_function.function.arguments)).map(([key, value]) => (
              <>
                <Text className="text-xs text-gray-600">{key}: {value}</Text>
                <br />
              </>
            ))}
          </Text>
        </View>
      ))}
    </View>
  );
} 