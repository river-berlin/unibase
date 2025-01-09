import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import type { Object3D, SceneState } from 'backend-js-api';

import { CommandTabs } from '../../../components/CommandTabs';
import { ThreeRenderer } from '../../../components/ThreeRenderer';

export default function DashboardPage() {
  const { id } = useLocalSearchParams();
  const [sceneState, setSceneState] = useState<SceneState>({
    objects: [],
    scene: {
      rotation: { x: 0, y: 0, z: 0 },
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      setError(null);
      const response = await api.projects.getProject(id as string);
      // Initialize scene state from project data if available
      if (response.data.sceneState) {
        setSceneState(response.data.sceneState);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setError('Error loading project');
    }
  };

  const handleGenerateObjects = async (instructions: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.projects.generateObjects(id as string, {
        currentObjects: sceneState.objects,
        sceneRotation: sceneState.scene?.rotation,
        instructions,
      });

      setSceneState(response.data);
    } catch (error) {
      console.error('Error generating objects:', error);
      setError(error instanceof Error ? error.message : 'Error generating objects');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex flex-1 flex-row">
      <View className="flex-1 border-r border-[#e0e0e0]">
        <CommandTabs 
          projectId={id as string} 
          objects={sceneState.objects}
          isLoading={isLoading}
          error={error}
          onGenerateObjects={handleGenerateObjects}
        />
      </View>
      <View className="flex-1 p-4 bg-white">
        <View className="flex-1 bg-white rounded-lg border border-[#e0e0e0]">
          <ThreeRenderer 
            projectId={id as string}
            objects={sceneState.objects}
            sceneRotation={sceneState.scene?.rotation}
          />
        </View>
      </View>
    </View>
  );
}