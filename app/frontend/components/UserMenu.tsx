import React, { useState } from 'react';
import { TouchableOpacity, View, Text, Modal, Pressable } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export const UserMenu = () => {
  const [visible, setVisible] = useState(false);
  const [isAdmin] = useState(false); // TODO: Get this from auth context

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleLogout = () => {
    // TODO: Implement logout logic
    closeMenu();
    router.replace('/(drawer)/login');
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
            {isAdmin && (
              <TouchableOpacity 
                className="p-4 border-b border-gray-200"
                onPress={() => {
                  closeMenu();
                  router.push('/(drawer)/admin');
                }}
              >
                <View className="flex-row items-center">
                  <MaterialIcons name="admin-panel-settings" size={20} color="#4f46e5" className="mr-2" />
                  <Text className="text-base text-purple-600">Admin Dashboard</Text>
                </View>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              className="p-4 border-b border-gray-200"
              onPress={() => {
                closeMenu();
                router.push('/(drawer)/settings');
              }}
            >
              <Text className="text-base">Settings</Text>
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