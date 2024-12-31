import { View, Text, Image, Pressable } from 'react-native';
import { Card } from './Card';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Member';
  avatar?: string;
}

interface TeamListProps {
  members: TeamMember[];
  onRoleChange?: (memberId: string, role: 'Owner' | 'Member') => void;
}

export function TeamList({ members, onRoleChange }: TeamListProps) {
  return (
    <Card>
      <Text className="text-lg font-semibold mb-2">Team Members</Text>
      <Text className="text-gray-500 text-sm mb-4">
        Invite your team members to collaborate.
      </Text>

      <View className="space-y-4">
        {members.map(member => (
          <View key={member.id} className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              {member.avatar ? (
                <Image
                  source={{ uri: member.avatar }}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
                  <Text className="text-gray-600 text-lg">
                    {member.name.charAt(0)}
                  </Text>
                </View>
              )}
              <View className="ml-3">
                <Text className="font-semibold">{member.name}</Text>
                <Text className="text-gray-500 text-sm">{member.email}</Text>
              </View>
            </View>

            <Pressable
              className="bg-gray-100 px-3 py-1 rounded-lg flex-row items-center"
              onPress={() => onRoleChange?.(member.id, member.role === 'Owner' ? 'Member' : 'Owner')}
            >
              <Text className="text-gray-700 mr-1">{member.role}</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color="#666" />
            </Pressable>
          </View>
        ))}
      </View>
    </Card>
  );
} 