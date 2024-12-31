import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Implement your login logic here
    console.log('Login attempted with:', email, password);
    // On successful login:
    // router.replace('/(drawer)');
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <View className="space-y-6">
        <Text className="text-3xl font-bold text-center text-gray-800">
          Welcome Back
        </Text>
        
        <TextInput
          className="w-full h-12 border border-gray-300 rounded-lg px-4"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          className="w-full h-12 border border-gray-300 rounded-lg px-4"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          className="w-full h-12 bg-blue-500 rounded-lg items-center justify-center"
          onPress={handleLogin}
        >
          <Text className="text-white font-semibold text-lg">Login</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center space-x-1">
          <Text className="text-gray-600">Don't have an account?</Text>
          <Link href="/register" className="text-blue-500 font-semibold">
            Register
          </Link>
        </View>
      </View>
    </View>
  );
} 