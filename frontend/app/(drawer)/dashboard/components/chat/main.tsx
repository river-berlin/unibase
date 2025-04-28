import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { DownloadSTL } from './DownloadSTL';
import { Editor } from './Editor';
import { TrainingStatus } from './TrainingStatus';
import { useProject } from '~/app/atoms';
import { useCode } from '~/app/atoms';
import { fetchCode, fetchHistory } from './logic';
import { useChatMessages } from '~/app/atoms';

  

export function Chat() {
  const {project} = useProject()
  const [keepInput, setKeepInput] = useState(false);
  const {setCode} = useCode();
  const {setAllMessages} = useChatMessages();

  useEffect(() => {
    if(!project) return;

    async function fetchProjectData() {
      if(!project) return;

      const code = await fetchCode(project.id)
      setCode(code)

      const history = await fetchHistory(project.id)
      setAllMessages(history)
    }

    fetchProjectData();
  }, [project]);


  return (
    <View className="w-[400px] border border-transparent border-r-gray-200 flex flex-col">
      <ChatInput
        keepInput={keepInput}
        onKeepInputChange={setKeepInput}
        className="border-b border-gray-200"
      />
      {project && <View className="p-2 border-t border-gray-200 bg-white">
        <TrainingStatus />
      </View>}
      <View className="flex-1">
        <ChatHistory />
      </View>
      
      <View className="p-2 border-t border-gray-200 bg-white">
        <Editor/>
      </View>

      {project && <View className="p-2 border-t border-gray-200 bg-white">
        <DownloadSTL projectId={project.id} />
      </View>}
    </View>
  );
} 