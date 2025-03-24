import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Redirect } from 'expo-router';
import { auth } from '../../../services/api';

export default function AdminIndex() {
  const router = useRouter();
  const currentUser = auth.getCurrentUser();
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    if (!currentUser?.is_admin) {
      Alert.alert('Access Denied', 'Admin access required');
      setIsAuthorized(false);
    }
  }, []);

  if (!isAuthorized) {
    return <Redirect href="/" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push('/admin/users')}
      >
        <View style={styles.cardContent}>
          <MaterialCommunityIcons name="account-group" size={32} color="black" />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>User Management</Text>
            <Text style={styles.cardDescription}>
              View, edit, and manage user accounts
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        </View>
      </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDescription: {
    color: '#666',
    marginTop: 4,
  },
}); 