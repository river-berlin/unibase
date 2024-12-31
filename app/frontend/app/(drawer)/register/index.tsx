import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    // Implement your registration logic here
    console.log('Register attempted with:', { name, email, password });
    // On successful registration:
    // router.replace('/(drawer)');
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <View className="space-y-6">
        <Text className="text-3xl font-bold text-center text-gray-800">
          Create Account
        </Text>

        <TextInput
          className="w-full h-12 border border-gray-300 rounded-lg px-4"
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />

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

        <TextInput
          className="w-full h-12 border border-gray-300 rounded-lg px-4"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          className="w-full h-12 bg-blue-500 rounded-lg items-center justify-center"
          onPress={handleRegister}
        >
          <Text className="text-white font-semibold text-lg">Register</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center space-x-1">
          <Text className="text-gray-600">Already have an account?</Text>
          <Link href="/login" className="text-blue-500 font-semibold">
            Login
          </Link>
        </View>
      </View>
    </View>
  );
} 