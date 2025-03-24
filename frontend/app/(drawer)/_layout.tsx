import { Drawer } from 'expo-router/drawer';
import { View } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Sidebar } from '../../components/Sidebar';

const CustomLayout = ({ children }: { children: React.ReactNode }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const drawerAnimation = useRef(new Animated.Value(1)).current;

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  useEffect(() => {
    Animated.timing(drawerAnimation, {
      toValue: isDrawerOpen ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isDrawerOpen]);

  const drawerWidth = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [64, 280],
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 flex-row">
        <Sidebar drawerWidth={drawerWidth} onToggleCollapse={handleDrawerToggle} isCollapsed={!isDrawerOpen} />
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
