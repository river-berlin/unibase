import { View, Text, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';

type ItemType = {
  type: 'directory' | 'project';
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  id?: string;
  description?: string;
};

const ProjectsPage = () => {
  const items: ItemType[] = [
    { type: 'directory', name: 'Personal Models', icon: 'folder' },
    { type: 'directory', name: 'Shared Models', icon: 'folder-multiple-outline' },
    { 
      type: 'project', 
      id: '1',
      name: 'Robot Arm', 
      icon: 'robot-industrial',
      description: 'Articulated robotic arm with 6 DOF'
    },
    { 
      type: 'project',
      id: '2', 
      name: 'Chess Set', 
      icon: 'chess-king',
      description: 'Complete chess set with custom pieces'
    },
    { 
      type: 'project',
      id: '3', 
      name: 'Car Engine', 
      icon: 'engine',
      description: 'V8 engine block with moving parts'
    },
    { 
      type: 'project',
      id: '4', 
      name: 'Architectural Model', 
      icon: 'home-modern',
      description: 'Modern house design with interior'
    },
    { 
      type: 'project',
      id: '5', 
      name: 'Drone Design', 
      icon: 'quadcopter',
      description: 'Custom quadcopter frame design'
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-row flex-wrap gap-4 p-4">
        {items.map((item) => (
          item.type === 'project' ? (
            <Link
              key={item.name}
              href={`/projects/${item.id}`}
              asChild
            >
              <Pressable
                className="w-64 h-32 bg-white rounded-xl shadow-sm p-4 flex-row items-center"
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={40}
                  color="#8b5cf6"
                />
                <View className="ml-4 flex-1">
                  <Text className="font-medium text-gray-900">{item.name}</Text>
                  <Text className="text-gray-500 text-sm mt-1">{item.description}</Text>
                </View>
              </Pressable>
            </Link>
          ) : (
            <Pressable
              key={item.name}
              className="w-64 h-32 bg-white rounded-xl shadow-sm p-4 flex-row items-center"
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={40}
                color="#60a5fa"
              />
              <View className="ml-4 flex-1">
                <Text className="font-medium text-gray-900">{item.name}</Text>
                <Text className="text-gray-500 text-sm mt-1">Directory</Text>
              </View>
            </Pressable>
          )
        ))}
      </View>
    </ScrollView>
  );
};

export default ProjectsPage;