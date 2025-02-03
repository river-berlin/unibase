import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApi } from '../../../services/api';

export default function Register() {
  const { auth, isInitialized } = useApi();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' | null }>({
    message: '',
    type: null,
  });

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setNotification({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    if (password.length < 8) {
      setNotification({ message: 'Password must be at least 8 characters long', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setNotification({ message: '', type: null });
      await auth.register(email, password, name);
      setNotification({ message: 'Registration successful! Redirecting to login...', type: 'success' });
      setTimeout(() => {
        router.replace('/login');
      }, 1500);
    } catch (error) {
      setNotification({
        message: error instanceof Error ? error.message : 'An error occurred during registration',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Register</Text>
        
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="account" size={24} color="black" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="email" size={24} color="black" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock" size={24} color="black" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {notification.message && (
          <View style={[styles.notification, notification.type === 'error' ? styles.errorNotification : styles.successNotification]}>
            <Text style={styles.notificationText}>{notification.message}</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Registering...' : 'Register'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.linkText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  icon: {
    padding: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 15,
  },
  linkText: {
    color: 'blue',
    fontSize: 14,
  },
  notification: {
    padding: 10,
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
  },
  errorNotification: {
    backgroundColor: '#ffebee',
    borderColor: '#ef5350',
    borderWidth: 1,
  },
  successNotification: {
    backgroundColor: '#e8f5e9',
    borderColor: '#66bb6a',
    borderWidth: 1,
  },
  notificationText: {
    textAlign: 'center',
    fontSize: 14,
  },
}); 