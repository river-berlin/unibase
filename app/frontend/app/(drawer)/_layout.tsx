import { Ionicons, MaterialIcons, FontAwesome5, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { View } from 'react-native';

import { HeaderButton } from '../../components/HeaderButton';
import { UserMenu } from '../../components/UserMenu';

const DrawerLayout = () => {
  const headerRight = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Link href="/modal" asChild>
        <HeaderButton />
      </Link>
      <UserMenu />
    </View>
  );

  return (
    <Drawer>
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: 'Home',
          drawerLabel: 'Home',
          drawerIcon: ({ size, color }) => <Ionicons name="home-outline" size={size} color={color} />,
          headerRight,
        }}
      />
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: 'Dashboard',
          drawerLabel: 'Dashboard',
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
          headerRight,
        }}
      />
      <Drawer.Screen
        name="admin/index"
        options={{
          headerTitle: 'Admin Dashboard',
          drawerLabel: 'Admin',
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="admin-panel-settings" size={size} color={color} />
          ),
          headerRight,
        }}
      />
      <Drawer.Screen
        name="login/index"
        options={{
          headerTitle: 'Login',
          drawerLabel: 'Login',
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="login" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="register/index"
        options={{
          headerTitle: 'Register',
          drawerLabel: 'Register',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="person-add-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings/index"
        options={{
          headerTitle: 'Settings',
          drawerLabel: 'Settings',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="billing/index"
        options={{
          headerTitle: 'Billing',
          drawerLabel: 'Billing',
          drawerIcon: ({ size, color }) => (
            <FontAwesome5 name="file-invoice-dollar" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="pricing/index"
        options={{
          headerTitle: 'Pricing',
          drawerLabel: 'Pricing',
          drawerIcon: ({ size, color }) => (
            <FontAwesome name="dollar" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="projects/index"
        options={{
          headerTitle: 'Projects',
          drawerLabel: 'Projects',
          drawerIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="folder-multiple" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="projects/[id]"
        options={{
          headerTitle: 'Project',
          drawerItemStyle: { display: 'none' },
          headerRight,
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
