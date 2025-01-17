import { View, Text, Pressable, ScrollView, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fontFamily } from '../config/fonts';
import { SidebarUserMenu } from './SidebarUserMenu';

interface SidebarProps {
  drawerWidth: Animated.AnimatedInterpolation<number>;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar = ({ drawerWidth, isCollapsed, onToggleCollapse }: SidebarProps) => {
  const router = useRouter();

  return (
    <Animated.View style={{
      width: drawerWidth,
      backgroundColor: 'white',
      borderRightWidth: 1,
      borderRightColor: '#e5e7eb',
      zIndex: 1,
      position: 'relative',
    }}>
      <View className="flex-1 flex-col h-full">
        {/* Collapse Button */}
        <Pressable
          onPress={onToggleCollapse}
          className="absolute -right-6 top-20 -translate-x-1/2 z-30 bg-white rounded-full w-6 h-6 flex items-center justify-center border border-gray-200"
        >
          <Feather 
            className={isCollapsed ? "translate-x-[0.3px]" : "-translate-x-[0.3px]"}
            name={isCollapsed ? "chevron-right" : "chevron-left"} 
            size={14} 
            color="#4b5563" 
          />
        </Pressable>

        <View className="border-b border-gray-200 relative z-20">
          <SidebarUserMenu isCollapsed={isCollapsed} />
        </View>
        <ScrollView className="flex-1 relative z-10">
          <View className={`py-2 ${isCollapsed ? 'mt-0' : ''}`}>
            <Text className={`text-xs text-gray-500 font-medium px-4 py-2 select-none ${isCollapsed ? 'hidden' : ''}`}>
              Platform
            </Text>
            {/* Home */}
            <Pressable
              onPress={() => router.push('/')}
              className="mx-2 my-0.5 rounded-md active:bg-gray-100 hover:bg-gray-50"
            >
              <View className={`flex-row items-center p-2 ${isCollapsed ? 'justify-center' : ''}`}>
                <Feather name="home" size={14} color="#4b5563" />
                <Text className={`ml-3 text-sm text-gray-600 select-none ${isCollapsed ? 'hidden' : ''}`} style={{ fontFamily: fontFamily.regular }}>
                  Home
                </Text>
              </View>
            </Pressable>
            {/* Login */}
            <Pressable
              onPress={() => router.push('/login')}
              className="mx-2 my-0.5 rounded-md active:bg-gray-100 hover:bg-gray-50"
            >
              <View className={`flex-row items-center p-2 ${isCollapsed ? 'justify-center' : ''}`}>
                <Feather name="log-in" size={14} color="#4b5563" />
                <Text className={`ml-3 text-sm text-gray-600 select-none ${isCollapsed ? 'hidden' : ''}`} style={{ fontFamily: fontFamily.regular }}>
                  Login
                </Text>
              </View>
            </Pressable>
            {/* Register */}
            <Pressable
              onPress={() => router.push('/register')}
              className="mx-2 my-0.5 rounded-md active:bg-gray-100 hover:bg-gray-50"
            >
              <View className={`flex-row items-center p-2 ${isCollapsed ? 'justify-center' : ''}`}>
                <Feather name="user-plus" size={14} color="#4b5563" />
                <Text className={`ml-3 text-sm text-gray-600 select-none ${isCollapsed ? 'hidden' : ''}`} style={{ fontFamily: fontFamily.regular }}>
                  Register
                </Text>
              </View>
            </Pressable>
            {/* Dashboard */}
            <Pressable
              onPress={() => router.push('/dashboard')}
              className="mx-2 my-0.5 rounded-md active:bg-gray-100 hover:bg-gray-50"
            >
              <View className={`flex-row items-center p-2 ${isCollapsed ? 'justify-center' : ''}`}>
                <Feather name="sidebar" size={14} color="#4b5563" />
                <Text className={`ml-3 text-sm text-gray-600 select-none ${isCollapsed ? 'hidden' : ''}`} style={{ fontFamily: fontFamily.regular }}>
                  Dashboard
                </Text>
              </View>
            </Pressable>
            {/* Billing */}
            <Pressable
              onPress={() => router.push('/billing')}
              className="mx-2 my-0.5 rounded-md active:bg-gray-100 hover:bg-gray-50"
            >
              <View className={`flex-row items-center p-2 ${isCollapsed ? 'justify-center' : ''}`}>
                <Feather name="credit-card" size={14} color="#4b5563" />
                <Text className={`ml-3 text-sm text-gray-600 select-none ${isCollapsed ? 'hidden' : ''}`} style={{ fontFamily: fontFamily.regular }}>
                  Billing
                </Text>
              </View>
            </Pressable>
            {/* Admin */}
            <Pressable
              onPress={() => router.push('/admin')}
              className="mx-2 my-0.5 rounded-md active:bg-gray-100 hover:bg-gray-50"
            >
              <View className={`flex-row items-center p-2 ${isCollapsed ? 'justify-center' : ''}`}>
                <Feather name="tool" size={14} color="#4b5563" />
                <Text className={`ml-3 text-sm text-gray-600 select-none ${isCollapsed ? 'hidden' : ''}`} style={{ fontFamily: fontFamily.regular }}>
                  Admin
                </Text>
              </View>
            </Pressable>
            {/* Pricing */}
            <Pressable
              onPress={() => router.push('/pricing')}
              className="mx-2 my-0.5 rounded-md active:bg-gray-100 hover:bg-gray-50"
            >
              <View className={`flex-row items-center p-2 ${isCollapsed ? 'justify-center' : ''}`}>
                <Feather name="tag" size={14} color="#4b5563" />
                <Text className={`ml-3 text-sm text-gray-600 select-none ${isCollapsed ? 'hidden' : ''}`} style={{ fontFamily: fontFamily.regular }}>
                  Pricing
                </Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Animated.View>
  );
}; 