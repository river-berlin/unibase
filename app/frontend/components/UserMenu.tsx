import React, { useState } from 'react';
import { TouchableOpacity, View, Text, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export const UserMenu = () => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleLogout = () => {
    // TODO: Implement logout logic
    closeMenu();
    router.replace('/login');
  };

  return (
    <View>
      <TouchableOpacity onPress={openMenu} className="p-2 mr-2">
        <Ionicons name="person-circle-outline" size={24} color="#000" />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable className="flex-1" onPress={closeMenu}>
          <View className="absolute right-4 top-16 w-48 bg-white rounded-lg shadow-lg">
            <TouchableOpacity 
              className="p-4 border-b border-gray-200"
              onPress={() => {
                closeMenu();
                router.push('/settings');
              }}
            >
              <Text className="text-base">Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="p-4 border-b border-gray-200"
              onPress={() => {
                closeMenu();
                router.push('/(drawer)/profile');
              }}
            >
              <Text className="text-base">Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="p-4"
              onPress={handleLogout}
            >
              <Text className="text-base text-red-500">Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}; 