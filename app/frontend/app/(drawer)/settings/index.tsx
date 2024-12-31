import { View, Text, Switch, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        {/* Notifications Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-4">Notifications</Text>
          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-base">Push Notifications</Text>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
              />
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-base">Email Notifications</Text>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
              />
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-4">Account</Text>
          <Pressable 
            className="flex-row justify-between items-center py-3 px-2"
            onPress={() => {}}
          >
            <Text className="text-base">Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Pressable>
          <Pressable 
            className="flex-row justify-between items-center py-3 px-2"
            onPress={() => {}}
          >
            <Text className="text-base">Privacy Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Pressable>
        </View>

        {/* Danger Zone */}
        <View>
          <Text className="text-lg font-bold mb-4 text-red-600">Danger Zone</Text>
          <Pressable 
            className="flex-row justify-between items-center py-3 px-2"
            onPress={() => {}}
          >
            <Text className="text-base text-red-600">Delete Account</Text>
            <Ionicons name="warning-outline" size={20} color="#DC2626" />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
} 