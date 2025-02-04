import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { NewDialog } from './NewDialog';

interface ProjectActionsProps {
  onSuccess: () => void;
  onNewProject: () => void;
}

export const ProjectActions = ({ onSuccess, onNewProject }: ProjectActionsProps) => {
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);

  return (
    <View className="flex-row gap-2">
      <Pressable
        className="px-2 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex-row items-center"
        onPress={onNewProject}
      >
        <MaterialCommunityIcons name="cube-outline" size={16} color="#4b5563" />
        <Text className="ml-1 text-gray-700 text-sm">New Project</Text>
      </Pressable>
    </View>
  );
}; 