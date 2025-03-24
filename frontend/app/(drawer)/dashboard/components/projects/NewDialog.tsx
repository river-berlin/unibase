import { View, Text, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import { useApi } from '../../../../../services/api';
import { createProjectWithConversation, getUserDetailsWithOrganizations } from '../../../../../client/sdk.gen';

interface NewDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const NewDialog = ({ onClose, onSuccess }: NewDialogProps) => {
  const { auth } = useApi();
  const [projectName, setProjectName] = useState('');

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;

    try {
      const user = await getUserDetailsWithOrganizations();
      if (!user?.data?.organizations?.[0]?.id) return;

      await createProjectWithConversation({
        body: {
          name: projectName.trim(),
          description: 'New VocalCAD project',
          organizationId: user.data.organizations[0].id
        }
      });

      setProjectName('');
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <View className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <View className="bg-white rounded-lg p-4 w-96 max-w-[90%]">
        <Text className="text-lg font-medium mb-4">Create New Project</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
          placeholder="Project Name"
          value={projectName}
          onChangeText={setProjectName}
        />
        <View className="flex-row justify-end gap-2">
          <Pressable
            className="px-4 py-2 rounded-lg bg-gray-100"
            onPress={onClose}
          >
            <Text>Cancel</Text>
          </Pressable>
          <Pressable
            className="px-4 py-2 rounded-lg bg-indigo-600"
            onPress={handleCreateProject}
          >
            <Text className="text-white">Create</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}; 