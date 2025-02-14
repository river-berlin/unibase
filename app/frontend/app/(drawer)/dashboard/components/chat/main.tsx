import React, { useState } from 'react';
import { View } from 'react-native';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { useChatLogic } from './logic';

interface ChatProps {
  projectId: string;
  onStlUpdate: (stl: string) => void;
}

export function Chat({ projectId, onStlUpdate }: ChatProps) {
  const [{ messages, isLoading }, { sendMessage }] = useChatLogic(projectId, onStlUpdate);
  const [instruction, setInstruction] = useState('');
  const [keepInput, setKeepInput] = useState(false);

  const handleSend = async () => {
    await sendMessage(instruction);
    if (!keepInput) {
      setInstruction('');
    }
  };

  return (
    <View className="w-[400px] border border-transparent border-r-gray-200">
      <ChatInput
        value={instruction}
        onChangeText={setInstruction}
        onSend={handleSend}
        isLoading={isLoading}
        keepInput={keepInput}
        onKeepInputChange={setKeepInput}
      />
      <View className="flex-1">
        <ChatHistory messages={messages} />
      </View>
    </View>
  );
} 