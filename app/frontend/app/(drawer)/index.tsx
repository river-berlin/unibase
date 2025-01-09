import { View, Text, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function Home() {
  const features = [
    {
      title: 'Voice Control',
      description: 'Design and model with natural voice commands',
      icon: 'microphone' as const,
    },
    {
      title: 'Physics Engine',
      description: 'Coming soon: Real-time physics simulation',
      icon: 'atom' as const,
    },
    {
      title: '3D Modeling',
      description: 'Professional-grade CAD modeling tools',
      icon: 'cube-outline' as const,
    },
  ];

  const stats = [
    { number: '350+', label: 'Voice Commands' },
    { number: '99%', label: 'Accuracy' },
    { number: '24/7', label: 'Support' },
  ];

  return (
    <View className="flex-1 bg-white p-6">
      <ScrollView className="border-2 border-black rounded-xl bg-white p-6">
        {/* Hero Section */}
        <View className="py-12">
          <View className="flex-row justify-center items-center gap-4 mb-6">
            <MaterialCommunityIcons name="microphone" size={48} color="#000" />
            <Text className="text-5xl font-bold text-gray-800">
              VocalCAD
            </Text>
          </View>
          <Text className="text-lg text-center text-gray-600 mb-8">
            Design and create 3D models naturally using voice commands
          </Text>
          <View className="flex-row justify-center">
            <Link href="/projects" asChild>
              <Pressable className="bg-gray-800 px-6 py-3 rounded-lg flex-row items-center space-x-2 border border-black">
                <MaterialCommunityIcons name="rocket-launch" size={20} color="#fff" />
                <Text className="text-white font-semibold">Get Started</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        {/* Stats Section */}
        <View className="flex-row justify-around py-12 border-t border-b border-black">
          {stats.map((stat, index) => (
            <View key={index} className="items-center">
              <Text className="text-2xl font-bold text-gray-800">{stat.number}</Text>
              <Text className="text-sm text-gray-600">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Features Section */}
        <View className="py-12">
          <Text className="text-2xl font-bold text-center text-gray-800 mb-8">
            Key Features
          </Text>
          <View className="space-y-6">
            {features.map((feature, index) => (
              <View
                key={index}
                className="flex-row items-start space-x-4 bg-gray-50 p-6 rounded-xl border border-black"
              >
                <MaterialCommunityIcons
                  name={feature.icon}
                  size={24}
                  color="#000"
                  style={{ marginTop: 2 }}
                />
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </Text>
                  <Text className="text-gray-600">{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View className="py-12 bg-gray-50 rounded-xl border border-black">
          <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
            Ready to Get Started?
          </Text>
          <Text className="text-center text-gray-600 mb-8">
            Join thousands of designers using VocalCAD today
          </Text>
          <View className="flex-row justify-center">
            <Link href="/projects" asChild>
              <Pressable className="bg-gray-800 px-8 py-4 rounded-lg flex-row items-center space-x-2 border border-black">
                <MaterialCommunityIcons name="rocket-launch" size={24} color="#fff" />
                <Text className="text-white font-semibold text-lg">Start Free Trial</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
