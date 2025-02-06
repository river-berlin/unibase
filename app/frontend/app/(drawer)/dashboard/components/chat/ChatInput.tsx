import React from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChangeText, onSend, isLoading }: ChatInputProps) {
  return (
    <View className="p-4 border-b border-gray-200 bg-white">
      <View className="flex-row items-center">
        <TextInput
          className="flex-1 p-2 mr-2 border border-gray-300 rounded"
          placeholder="Enter instructions..."
          value={value}
          onChangeText={onChangeText}
          multiline
          numberOfLines={1}
          editable={!isLoading}
        />
        <TouchableOpacity
          className={`justify-center p-1 rounded border border-black ${isLoading ? 'bg-gray-100' : 'bg-white'}`}
          onPress={onSend}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Ionicons name="arrow-forward" size={23} color="black" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
} 