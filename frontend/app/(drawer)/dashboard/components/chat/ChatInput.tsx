import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Toggle } from './Toggle';
import { sendMessage } from './logic';
import { useSceneImage } from '~/app/atoms';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  keepInput: boolean;
  onKeepInputChange: (value: boolean) => void;
  className?: string;
}

export function ChatInput({ 
  value, 
  onChangeText, 
  keepInput,
  onKeepInputChange,
  className = ''
}: ChatInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { sceneImage } = useSceneImage();

  const onPressSend = async () => {
    if (!value.trim() || isLoading) return;
    
    setIsLoading(true);
    await sendMessage(value, sceneImage);
    
    if (!keepInput) {
      onChangeText('');
    }
    
    setIsLoading(false);
  };

  return (
    <View className={`p-4 bg-white ${className}`}>
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
          onPress={onPressSend}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Ionicons name="arrow-forward" size={23} color="black" />
          )}
        </TouchableOpacity>
      </View>
      <View className="flex justify-end mt-2">
        <Toggle
          value={keepInput}
          onChange={onKeepInputChange}
          label="Keep input after send"
          className="justify-start"
        />
      </View>
    </View>
  );
} 