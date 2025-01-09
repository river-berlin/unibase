import { View, Text, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import { useApi } from '../../../../services/api';
import { useProjects } from '../../../../services/projects';
import type { User } from '../../../../src/backend-js-api';

type UserWithOrg = User & { organizations: { id: string; name: string }[] };

interface NewFolderDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const NewFolderDialog = ({ onClose, onSuccess }: NewFolderDialogProps) => {
  const { auth } = useApi();
  const { folders: foldersApi } = useProjects();
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const user = await auth.getCurrentUser() as UserWithOrg;
      await foldersApi.createFolder({
        name: newFolderName.trim(),
        organizationId: user.organizations[0].id
      });

      setNewFolderName('');
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  return (
    <View className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <View className="bg-white rounded-lg p-4 w-96 max-w-[90%]">
        <Text className="text-lg font-medium mb-4">Create New Folder</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
          placeholder="Folder Name"
          value={newFolderName}
          onChangeText={setNewFolderName}
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
            onPress={handleCreateFolder}
          >
            <Text className="text-white">Create</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}; 