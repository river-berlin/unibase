import { View, Text, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProjectsPage = () => {
  const items = [
    { type: 'directory', name: 'Personal Projects', icon: 'folder' },
    { type: 'directory', name: 'Work Projects', icon: 'folder' },
    { type: 'project', name: 'Mobile App', icon: 'cellphone' },
    { type: 'project', name: 'Website', icon: 'web' },
    { type: 'project', name: 'API Service', icon: 'api' },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-row flex-wrap gap-4 p-4">
        {items.map((item) => (
          <Pressable
            key={item.name}
            className="w-32 h-32 bg-white rounded-xl shadow-sm items-center justify-center p-4"
          >
            <MaterialCommunityIcons
              size={40}
              color={item.type === 'directory' ? '#60a5fa' : '#8b5cf6'}
            />
            <Text className="text-center mt-2 text-gray-700">{item.name}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

export default ProjectsPage;