import { useRef, useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThreeRenderer } from './components/render/ThreeRenderer';
import { Chat } from './components/chat/main';
import { getProjectWithFolderInfo } from '~/client';
import { useProject, useCode, useChatMessages } from "~/app/atoms"

export default function ProjectPage() {
  const { id } = useLocalSearchParams();
  const { setProject } = useProject();
  const { setCode } = useCode();
  const { setAllMessages } = useChatMessages();

  useEffect(() => {
    // Skip if id is not a string or is empty
    if (!id || typeof id !== 'string') return;

    setCode([]);
    setAllMessages([]);

    // Fetch project data
    const fetchProject = async () => {
      const response = await getProjectWithFolderInfo({ path: { projectId: id as string } });
      
      if (response.data) {
        setProject({
          id: id as string,
          name: response.data.name || '',
          description: response.data.description || '',
          organizationId: response.data.organization_id || '',
          folderId: response.data.folder_id || null,
          createdAt: response.data.created_at || new Date().toISOString(),
          updatedAt: response.data.updated_at || new Date().toISOString()
        });
      }
    };
    
    fetchProject();
  }, [id]); // Only re-run when id changes

  const sceneImageRef = useRef<string>('');
  const setSceneImage = (image: string) => {
    sceneImageRef.current = image;
  };

  return (
    <View className="flex-1 bg-white flex-row">
      <Chat />
      <View className="flex-1">
        <ThreeRenderer 
          setScene={setSceneImage}
        />
      </View>
    </View>
  );
}