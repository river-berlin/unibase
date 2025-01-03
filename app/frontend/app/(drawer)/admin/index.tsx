import { View, Text, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Users', value: '1,234', icon: 'account-group' },
    { title: 'Active Projects', value: '789', icon: 'folder-multiple' },
    { title: 'Storage Used', value: '2.1 TB', icon: 'database' },
    { title: 'Daily Active', value: '456', icon: 'chart-line' },
  ];

  const recentUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'User' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Admin' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          {stats.map((stat) => (
            <View key={stat.title} className="flex-1 min-w-[150px] bg-white p-4 rounded-xl shadow-sm">
              <MaterialCommunityIcons name={stat.icon} size={24} color="#4f46e5" />
              <Text className="text-2xl font-bold mt-2">{stat.value}</Text>
              <Text className="text-gray-600">{stat.title}</Text>
            </View>
          ))}
        </View>

        {/* Recent Users */}
        <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <Text className="text-xl font-bold mb-4">Recent Users</Text>
          <View className="space-y-4">
            {recentUsers.map((user) => (
              <View key={user.id} className="flex-row items-center justify-between py-2 border-b border-gray-100">
                <View>
                  <Text className="font-medium">{user.name}</Text>
                  <Text className="text-gray-600 text-sm">{user.email}</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className={`mr-2 ${user.role === 'Admin' ? 'text-purple-600' : 'text-gray-600'}`}>
                    {user.role}
                  </Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
                </View>
              </View>
            ))}
          </View>
          <Pressable className="mt-4 py-2">
            <Text className="text-purple-600 text-center">View All Users</Text>
          </Pressable>
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-xl shadow-sm p-4">
          <Text className="text-xl font-bold mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap gap-4">
            <Pressable className="flex-1 min-w-[150px] p-4 bg-gray-50 rounded-lg">
              <MaterialCommunityIcons name="account-plus" size={24} color="#4f46e5" />
              <Text className="mt-2 font-medium">Add User</Text>
            </Pressable>
            <Pressable className="flex-1 min-w-[150px] p-4 bg-gray-50 rounded-lg">
              <MaterialCommunityIcons name="cog" size={24} color="#4f46e5" />
              <Text className="mt-2 font-medium">System Settings</Text>
            </Pressable>
            <Pressable className="flex-1 min-w-[150px] p-4 bg-gray-50 rounded-lg">
              <MaterialCommunityIcons name="backup-restore" size={24} color="#4f46e5" />
              <Text className="mt-2 font-medium">Backup Data</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 