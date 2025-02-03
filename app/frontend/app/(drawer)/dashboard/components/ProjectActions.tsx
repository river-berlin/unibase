import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApi } from '../../../../services/api';
import { createProjectWithConversation, getUserDetailsWithOrganizations } from '../../../../client/sdk.gen';

interface ProjectActionsProps {
  onSuccess: () => void;
}

export const ProjectActions = ({ onSuccess }: ProjectActionsProps) => {
  const { auth } = useApi();

  const handleCreateProject = async (fileType: 'vocalcad' | 'stl') => {
    try {
      const user = await getUserDetailsWithOrganizations();
      if (!user?.data?.organizations?.[0]?.id) return;

      const projectName = `New ${fileType === 'stl' ? 'STL' : 'VocalCad'} Project`;
      const description = fileType === 'stl' ? 'Imported STL project' : 'New VocalCad project';
      
      await createProjectWithConversation({
        body: {
          name: projectName,
          description,
          organizationId: user.data.organizations[0].id
        }
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <View className="flex-row gap-2">
      <Pressable
        className="px-2 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex-row items-center"
        onPress={() => handleCreateProject('vocalcad')}
      >
        <MaterialCommunityIcons name="cube-outline" size={16} color="#4b5563" />
        <Text className="ml-1 text-gray-700 text-sm">New Project</Text>
      </Pressable>
      <Pressable
        className="px-2 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex-row items-center"
        onPress={() => handleCreateProject('stl')}
      >
        <MaterialCommunityIcons name="cube-scan" size={16} color="#4b5563" />
        <Text className="ml-1 text-gray-700 text-sm">Import STL</Text>
      </Pressable>
    </View>
  );
}; 