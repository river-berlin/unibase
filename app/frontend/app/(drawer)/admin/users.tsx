import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApi } from '../../../services/api';
import type { User } from '../../../src/backend-js-api';

// Extended user type for admin view
interface AdminUser extends User {
  is_admin: boolean;
}

export default function AdminUsers() {
  const { admin, auth, isInitialized } = useApi();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const user = await auth.getCurrentUser() as User | null;
      setCurrentUser(user);
      
      // Check if user is an admin based on their organization role
      const isAdmin = user?.organizations?.some(org => org.role === 'admin' || org.role === 'owner');
      if (!isAdmin) {
        Alert.alert('Access Denied', 'Admin access required');
        router.replace('/');
        return;
      }
      
      fetchUsers();
    };

    if (isInitialized) {
      init();
    }
  }, [isInitialized]);

  const fetchUsers = async () => {
    try {
      const response = await admin.getUsers();
      setUsers(response.data as AdminUser[]);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to fetch users'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (user: AdminUser) => {
    if (user.id === currentUser?.id) {
      Alert.alert('Error', 'Cannot modify your own admin status');
      return;
    }

    try {
      await admin.updateUserRole(user.id, { isAdmin: !user.is_admin });
      
      setUsers(users.map(u => 
        u.id === user.id 
          ? { ...u, is_admin: !u.is_admin }
          : u
      ));
      
      Alert.alert('Success', `Admin status ${!user.is_admin ? 'granted' : 'revoked'}`);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update user role'
      );
    }
  };

  const deleteUser = async (user: AdminUser) => {
    if (user.id === currentUser?.id) {
      Alert.alert('Error', 'Cannot delete your own account');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await admin.deleteUser(user.id);
              setUsers(users.filter(u => u.id !== user.id));
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to delete user'
              );
            }
          }
        }
      ]
    );
  };

  const renderUser = ({ item: user }: { item: AdminUser }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userDate}>
          Joined: {new Date(user.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, user.is_admin ? styles.adminButton : styles.userButton]}
          onPress={() => toggleAdminStatus(user)}
          disabled={user.id === currentUser?.id}
        >
          <MaterialCommunityIcons
            name={user.is_admin ? 'shield' : 'shield-outline'}
            size={24}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteUser(user)}
          disabled={user.id === currentUser?.id}
        >
          <MaterialCommunityIcons
            name="delete"
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isInitialized || loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Management</Text>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={user => user.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    gap: 10,
  },
  userCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#666',
    marginTop: 4,
  },
  userDate: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminButton: {
    backgroundColor: '#4CAF50',
  },
  userButton: {
    backgroundColor: '#9E9E9E',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
}); 