import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useProject } from '~/app/atoms';
import { updateProjectAttributes } from '../../../../../client/sdk.gen';
import type { UpdateProjectAttributesData } from '../../../../../client/types.gen';
import { Toggle } from './Toggle';

/**
 * Component to display and manage training data status
 */
export function TrainingStatus() {
  const { project, setProject } = useProject();
  const [isTrainingData, setIsTrainingData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize state when project changes
  useEffect(() => {
    if (project) {
      setIsTrainingData(!!project.use_for_training);
    }
  }, [project]);

  // Handle toggle change
  const handleToggleChange = async (newValue: boolean) => {
    if (!project) return;
    
    setIsLoading(true);
    try {
      // Need to cast the body to any because the SDK doesn't include use_for_training yet
      const requestData = {
        path: { projectId: project.id },
        body: {} as any,
        url: '/projects/{projectId}'
      } as UpdateProjectAttributesData;
      // Add use_for_training to the body
      (requestData.body as any).use_for_training = newValue;
      
      const response = await updateProjectAttributes(requestData);      
      // Update local state with the response
      const useForTraining = response.data?.use_for_training;
      setIsTrainingData(!!useForTraining);
      
      // Update the project in the global state
      if (setProject && response) {
        setProject({
          ...project,
          use_for_training: !!useForTraining
        });
      }
    } catch (error) {
      console.error('Error updating training status:', error);
      // Revert to previous state on error
      setIsTrainingData(!newValue);
    } finally {
      setIsLoading(false);
    }
  };

  if (!project) return null;

  // Format date string for display
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Never';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <View className="p-2">
      <View className="mb-2">
        <Toggle
          value={isTrainingData}
          onChange={handleToggleChange}
          label="Use for training data"
          className="justify-start"
        />
      </View>
      
      {/* Training status indicators - read-only */}
      <View className="mt-2 p-2 bg-gray-100 rounded-md">
        <Text className="text-xs text-gray-500 mb-1">Training Status</Text>
        <View className="flex-row justify-between">
          <Text className="text-xs">Trained:</Text>
          <Text className="text-xs font-medium">
            {project.already_trained ? 'Yes' : 'No'}
          </Text>
        </View>
        <View className="flex-row justify-between mt-1">
          <Text className="text-xs">Last trained:</Text>
          <Text className="text-xs font-medium">
            {formatDate(project.trained_at)}
          </Text>
        </View>
      </View>
    </View>
  );
}
