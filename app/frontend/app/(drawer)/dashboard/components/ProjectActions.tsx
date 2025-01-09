import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApi } from '../../../../services/api';
import { useProjects } from '../../../../services/projects';
import type { User } from '../../../../src/backend-js-api';

type UserWithOrg = User & { organizations: { id: string; name: string }[] };

interface ProjectActionsProps {
  onSuccess: () => void;
}

export const ProjectActions = ({ onSuccess }: ProjectActionsProps) => {
  const { auth } = useApi();
  const { projects: projectsApi } = useProjects();

  const handleCreateProject = async (fileType: 'vocalcad' | 'stl') => {
    try {
      const user = await auth.getCurrentUser() as UserWithOrg;
      const projectName = `New ${fileType === 'stl' ? 'STL' : 'VocalCad'} Project`;
      
      await projectsApi.createProject({
        name: projectName,
        description: 'New project description',
        organizationId: user.organizations[0].id,
        icon: fileType === 'stl' ? 'cube-scan' : 'cube-outline'
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