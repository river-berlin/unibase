import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Image, Alert, Button } from 'react-native';
import { supabase } from '../lib/supabase'


export default function Welcome(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) Alert.alert(error.message)
      setLoading(false)
  }

  async function signUpWithEmail() {
      setLoading(true)
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email: email,
        password: password,
      })

      if (error) Alert.alert(error.message)
      if (!session) Alert.alert('Please check your inbox for email verification!')
      setLoading(false)
  }

  return (
    <View className="flex-1 justify-center bg-white p-4 w-screen h-screen items-center">
      <View className="items-center mb-10">
        <Image
          source={{ uri: 'https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600' }}
          className="h-10 w-10"
          alt="Your Company"
        />
        <Text className="mt-4 text-2xl font-bold text-gray-900">
          Sign in to your account
        </Text>
      </View>

      <View className="w-full max-w-sm self-center">
        <View className="mb-5">
          <Text className="text-sm font-medium text-gray-900">Email address</Text>
          <TextInput
            className="mt-2 w-full rounded-md border border-gray-300 p-3 text-sm text-gray-900"
            placeholder="Email address"
            keyboardType="email-address"
            autoComplete="email"
            onChangeText={email => setEmail(email)}
          />
        </View>

        <View className="mb-5">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-medium text-gray-900">Password</Text>
            <TouchableOpacity>
              <Text className="text-sm font-semibold text-indigo-600">
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            className="mt-2 w-full rounded-md border border-gray-300 p-3 text-sm text-gray-900"
            placeholder="Password"
            secureTextEntry
            autoComplete="current-password"
            onChangeText={password => setPassword(password)}
          />
        </View>

        <TouchableOpacity className="bg-indigo-600 p-3 rounded-md items-center" onPress={() => signInWithEmail()}>
          <Text className="text-sm font-semibold text-white">Sign in</Text>
        </TouchableOpacity>

        <Text className="text-center text-sm text-gray-500 mt-5">
          Not a member?{' '}
          <Text className="font-semibold text-indigo-600">Start a 14 day free trial</Text>
        </Text>
      </View>
    </View>
  );
}