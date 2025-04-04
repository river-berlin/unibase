import React, { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Toggle } from './Toggle';
import { sendMessage } from './logic';
import { useSceneImage } from '~/app/atoms';
import { useProject } from '~/app/atoms';
import { useCode } from '~/app/atoms';
import { useChatMessages } from '~/app/atoms';
import { fetchCode } from './logic';

interface ChatInputProps {
  keepInput: boolean;
  onKeepInputChange: (value: boolean) => void;
  className?: string;
}

export function ChatInput({
  keepInput,
  onKeepInputChange,
  className = ''
}: ChatInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState("");

  const { sceneImage } = useSceneImage();
  const {project} = useProject();
  const {messages, setAllMessages} = useChatMessages();
  const {setCode} = useCode();

  const onPressSend = async () => {
    if (!project) return;
    if (!value.trim() || isLoading) return;
    
    setIsLoading(true);
    const newMessages = await sendMessage(project.id, value, sceneImage);
    setAllMessages([...messages, ...newMessages]);

    const code = await fetchCode(project.id);
    setCode(code);


    if (!keepInput) {
      setValue('');
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
          onChangeText={setValue}
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