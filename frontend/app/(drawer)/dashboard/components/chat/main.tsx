import React, { useState } from 'react';
import { View } from 'react-native';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { DownloadSTL } from './DownloadSTL';
import { Editor } from './Editor';
import { useChatLogic } from './logic';
import { useProject } from '~/app/atoms';

export function Chat() {
  const {project} = useProject()
  const [instruction, setInstruction] = useState('');
  const [keepInput, setKeepInput] = useState(false);

  useChatLogic();

  if(!project) return;


  return (
    <View className="w-[400px] border border-transparent border-r-gray-200 flex flex-col">
      <ChatInput
        value={instruction}
        onChangeText={setInstruction}
        keepInput={keepInput}
        onKeepInputChange={setKeepInput}
        className="border-b border-gray-200"
      />
      <View className="flex-1">
        <ChatHistory />
      </View>
      
      <View className="p-2 border-t border-gray-200 bg-white">
        <Editor/>
      </View>

      <View className="p-2 border-t border-gray-200 bg-white">
        <DownloadSTL projectId={project.id} />
      </View>
    </View>
  );
} 