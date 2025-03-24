import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorsProps {
  errors: string[];
}

export function Errors({ errors }: ErrorsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!errors || errors.length === 0) return null;

  return (
    <View className="mt-2 border-l-4 border-red-500 pl-2">
      <TouchableOpacity 
        className="flex-row items-center justify-between"
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text className="font-semibold text-xs text-red-500">Errors</Text>
        <Ionicons 
          name={isExpanded ? 'chevron-down' : 'chevron-forward'} 
          size={16} 
          color="#EF4444"
        />
      </TouchableOpacity>

      {isExpanded && errors.map((error, i) => (
        <Text key={i} className="text-xs text-red-500">{error}</Text>
      ))}
    </View>
  );
} 