import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThreeRenderer } from './components/render/ThreeRenderer';
import { Chat } from './components/chat/main';


export default function ProjectPage() {
  const { id } = useLocalSearchParams();
  const [stlData, setStlData] = useState<string | null>(null);

  const handleStlUpdate = (stl: string) => {
    setStlData(stl);
  };

  return (
    <View className="flex-1 bg-white flex-row">
      <Chat
        projectId={id as string}
        onStlUpdate={handleStlUpdate}
      />
      <View className="flex-1">
        <ThreeRenderer stlData={stlData} />
      </View>
    </View>
  );
}