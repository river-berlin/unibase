import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { useState, useEffect } from 'react';
import { useApi } from '../../../services/api';
import type { Object3D, SceneState, Project } from '../../../src/backend-js-api';

import { CommandTabs } from '../../../components/CommandTabs';
import { ThreeRenderer } from '../../../components/ThreeRenderer';
import { storage } from '~/services/storage';


export default function ProjectPage() {
  const { id } = useLocalSearchParams();
  const { api, waitForInitialization } = useApi();
  const [sceneState, setSceneState] = useState<SceneState>({
    objects: [],
    scene: {
      rotation: { x: 0, y: 0, z: 0 },
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await waitForInitialization();
      loadProject();
    };
    init();
  }, [id]);

  const loadProject = async () => {
    try {
      setError(null);
      const project = await api.projects.getProject(id as string);
      // Initialize scene state from project data if available
      if (project.sceneState) {
        setSceneState(project.sceneState);
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

      console.log(api)
      
      // Call the Gemini service to generate objects
      const response = await api.gemini.generateObjects({
        instructions,
        currentObjects: sceneState.objects,
        sceneRotation: sceneState.scene?.rotation,
      });

      // Update the scene state with the generated objects
      const newSceneState: SceneState = {
        objects: response.json.objects,
        scene: {
          rotation: response.json.scene.rotation,
        },
        reasoning: response.reasoning,
      };
      
      setSceneState(newSceneState);

      // Save the updated scene state to the project
      await api.projects.updateProject(id as string, {
        sceneState: newSceneState
      });

    } catch (error) {
      console.error('Error generating objects:', error);
      setError(error instanceof Error ? error.message : 'Error generating objects');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex flex-1 flex-column">
      <View className="flex-1 border-r border-[#e0e0e0]">
        <View className="flex-1 p-4 bg-white">
            <ThreeRenderer 
              projectId={id as string}
              objects={sceneState.objects}
              sceneRotation={sceneState.scene?.rotation}
            />
        </View>
        <CommandTabs 
          projectId={id as string} 
          objects={sceneState.objects}
          isLoading={isLoading}
          error={error}
          onGenerateObjects={handleGenerateObjects}
        />
      </View>
    </View>
  );
}