import { Feather } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { View, Text, Pressable, ScrollView, Animated } from 'react-native';
import { fontFamily } from '../../config/fonts';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderButton } from '../../components/HeaderButton';
import { UserMenu } from '../../components/UserMenu';

interface CustomDrawerProps extends DrawerContentComponentProps {
  drawerWidth: Animated.AnimatedInterpolation<number>;
}

const HEADER_HEIGHT = 56;

const CustomLayout = ({ children }: { children: React.ReactNode }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const drawerAnimation = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.timing(drawerAnimation, {
      toValue: isDrawerOpen ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isDrawerOpen]);

  const drawerWidth = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 280],
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="h-14 bg-white border-b border-gray-200 flex-row items-center z-10">
        <Pressable className="ml-4" onPress={() => setIsDrawerOpen(!isDrawerOpen)}>
          <Feather name="sidebar" size={24} color="#111827" />
        </Pressable>
        <Text className="flex-1 ml-4 text-sm text-gray-900" style={{ fontFamily: fontFamily.medium }}>
          VoiceCAD
        </Text>
        <View className="flex-row items-center mr-4 gap-2">
          <Link href="/modal" asChild>
            <HeaderButton />
          </Link>
          <UserMenu />
        </View>
      </View>

      {/* Content area with drawer and main content */}
      <View className="flex-1 flex-row">
        {/* Drawer */}
        <Animated.View style={{
          width: drawerWidth,
          backgroundColor: 'white',
          borderRightWidth: 1,
          borderRightColor: '#e5e7eb',
          zIndex: 1,
        }}>
          <ScrollView>
            <View className="py-2">
              <Text className="text-xs text-gray-500 font-medium px-4 py-2">
                Platform
              </Text>
              {/* Home */}
              <Pressable
                onPress={() => router.push('/')}
                className="mx-2 my-0.5 rounded-md active:bg-gray-100 hover:bg-gray-50"
              >
                <View className="flex-row items-center p-2">
                  <Feather name="home" size={14} color="#4b5563" />
                  <Text className="ml-3 text-sm text-gray-600" style={{ fontFamily: fontFamily.regular }}>
                    Home
                  </Text>
                </View>
              </Pressable>
              {/* Login */}
              <Pressable
                onPress={() => router.push('/login')}
                className="mx-2 my-0.5 rounded-md active:bg-gray-100 hover:bg-gray-50"
              >
                <View className="flex-row items-center p-2">
                  <Feather name="log-in" size={14} color="#4b5563" />
                  <Text className="ml-3 text-sm text-gray-600" style={{ fontFamily: fontFamily.regular }}>
                    Login
                  </Text>
                </View>
              </Pressable>
              {/* Register */}
              <Pressable
                onPress={() => router.push('/register')}
                className="mx-2 my-0.5 rounded-md active:bg-gray-100 hover:bg-gray-50"
              >
                <View className="flex-row items-center p-2">
                  <Feather name="user-plus" size={14} color="#4b5563" />
                  <Text className="ml-3 text-sm text-gray-600" style={{ fontFamily: fontFamily.regular }}>
                    Register
                  </Text>
                </View>
              </Pressable>
              {/* Dashboard */}
              <Pressable
                onPress={() => router.push('/dashboard')}
                className="mx-2 my-0.5 rounded-md active:bg-gray-100 hover:bg-gray-50"
              >
                <View className="flex-row items-center p-2">
                  <Feather name="sidebar" size={14} color="#4b5563" />
                  <Text className="ml-3 text-sm text-gray-600" style={{ fontFamily: fontFamily.regular }}>
                    Dashboard
                  </Text>
                </View>
              </Pressable>
              {/* Settings */}
              <Pressable
                onPress={() => router.push('/settings')}
                className="mx-2 my-0.5 rounded-md active:bg-gray-100 hover:bg-gray-50"
              >
                <View className="flex-row items-center p-2">
                  <Feather name="settings" size={14} color="#4b5563" />
                  <Text className="ml-3 text-sm text-gray-600" style={{ fontFamily: fontFamily.regular }}>
                    Settings
                  </Text>
                </View>
              </Pressable>
              {/* Billing */}
              <Pressable
                onPress={() => router.push('/billing')}
                className="mx-2 my-0.5 rounded-md active:bg-gray-100 hover:bg-gray-50"
              >
                <View className="flex-row items-center p-2">
                  <Feather name="credit-card" size={14} color="#4b5563" />
                  <Text className="ml-3 text-sm text-gray-600" style={{ fontFamily: fontFamily.regular }}>
                    Billing
                  </Text>
                </View>
              </Pressable>
              {/* Admin */}
              <Pressable
                onPress={() => router.push('/admin')}
                className="mx-2 my-0.5 rounded-md active:bg-gray-100 hover:bg-gray-50"
              >
                <View className="flex-row items-center p-2">
                  <Feather name="tool" size={14} color="#4b5563" />
                  <Text className="ml-3 text-sm text-gray-600" style={{ fontFamily: fontFamily.regular }}>
                    Admin
                  </Text>
                </View>
              </Pressable>
              {/* Pricing */}
              <Pressable
                onPress={() => router.push('/pricing')}
                className="mx-2 my-0.5 rounded-md active:bg-gray-100 hover:bg-gray-50"
              >
                <View className="flex-row items-center p-2">
                  <Feather name="tag" size={14} color="#4b5563" />
                  <Text className="ml-3 text-sm text-gray-600" style={{ fontFamily: fontFamily.regular }}>
                    Pricing
                  </Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Main Content */}
        <View className="flex-1">
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
};

const DashboardLayout = () => {
  return (
    <CustomLayout>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerType: 'permanent',
          drawerStyle: {
            width: 0,
            opacity: 0,
          }
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'Home',
            drawerIcon: ({ color }) => <Feather name="home" size={14} color={color} />,
          }}
        />
        <Drawer.Screen
          name="login/index"
          options={{
            drawerLabel: 'Login',
            drawerIcon: ({ color }) => <Feather name="log-in" size={14} color={color} />,
          }}
        />
        <Drawer.Screen
          name="register/index"
          options={{
            drawerLabel: 'Register',
            drawerIcon: ({ color }) => <Feather name="user-plus" size={14} color={color} />,
          }}
        />
        <Drawer.Screen
          name="dashboard/index"
          options={{
            drawerLabel: 'Dashboard',
            drawerIcon: ({ color }) => (
              <Feather name="sidebar" size={14} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="settings/index"
          options={{
            drawerLabel: 'Settings',
            drawerIcon: ({ color }) => (
              <Feather name="settings" size={14} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="billing/index"
          options={{
            drawerLabel: 'Billing',
            drawerIcon: ({ color }) => (
              <Feather name="credit-card" size={14} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="admin/index"
          options={{
            drawerLabel: 'Admin',
            drawerIcon: ({ color }) => (
              <Feather name="tool" size={14} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="pricing/index"
          options={{
            drawerLabel: 'Pricing',
            drawerIcon: ({ color }) => (
              <Feather name="tag" size={14} color={color} />
            ),
          }}
        />
      </Drawer>
    </CustomLayout>
  );
};

export default DashboardLayout;
