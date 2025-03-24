import { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fontFamily } from '../config/fonts';
import { getUserDetailsWithOrganizations } from '../client/sdk.gen';
import type { GetUserDetailsWithOrganizationsResponse } from '../client/types.gen';
import { useApi } from '../services/api';
interface SidebarUserMenuProps {
  isCollapsed: boolean;
}

export const SidebarUserMenu = ({ isCollapsed }: SidebarUserMenuProps) => {
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Placeholder user data - replace with actual user data later
  const [user, setUser] = useState<GetUserDetailsWithOrganizationsResponse | null>(null);
  const { auth } = useApi();

  const loadUserDetails = async () => {
    const user = await getUserDetailsWithOrganizations();
    if (user.data) {
      setUser(user.data);
    }
  };

  useEffect(() => {
    loadUserDetails();
  }, []);
  

  const handleLogout = () => {
    setMenuVisible(false);
    // Add logout logic here
    auth.logout();
  };

  return (
    <View className="py-2 bg-white">
      <Pressable 
        onPress={() => setMenuVisible(!menuVisible)}
        className="flex-row items-center justify-between p-2 mx-2 rounded-md bg-white hover:bg-gray-50 active:bg-gray-100"
      >
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
            <Text className="text-sm text-gray-600 select-none" style={{ fontFamily: fontFamily.medium }}>
              {user?.name?.charAt(0)}
            </Text>
          </View>
          {!isCollapsed && (
            <View className="ml-3">
              <Text className="text-sm text-gray-900 select-none" style={{ fontFamily: fontFamily.medium }}>
                {user?.name}
              </Text>
              <Text className="text-xs text-gray-500 select-none" style={{ fontFamily: fontFamily.regular }}>
                {user?.email}
              </Text>
            </View>
          )}
        </View>
        {!isCollapsed && (
          <Feather 
            name={menuVisible ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#6b7280"
          />
        )}
      </Pressable>

      {menuVisible && !isCollapsed && (
        <View className="absolute top-full left-2 right-2 mt-1 py-1 bg-white rounded-md border border-gray-200 z-30">
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center p-3 bg-white hover:bg-gray-50 active:bg-gray-100"
          >
            <Feather name="log-out" size={16} color="#4b5563" />
            <Text className="ml-3 text-sm text-gray-700 select-none" style={{ fontFamily: fontFamily.regular }}>
              Logout
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}; 