import { Stack } from 'expo-router';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import WebView from 'react-native-webview';

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

  const VideoSection = Platform.select({
    web: () => (
      <View className="h-64 mx-6 my-8">
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/your-video-id"
          title="Product Demo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            borderRadius: 12,
          }}
        />
      </View>
    ),
    default: () => (
      <View className="h-64 bg-gray-200 mx-6 my-8 rounded-xl overflow-hidden">
        <WebView
          source={{ uri: 'https://www.youtube.com/embed/your-video-id' }}
          className="flex-1"
        />
      </View>
    ),
  });

  return (
    <>
      <Stack.Screen options={{ title: 'VoiceCAD' }} />
      <ScrollView className="flex-1 bg-white">
        {/* Hero Section */}
        <View className="px-6 py-12 bg-gray-50">
          <Text className="text-4xl font-bold text-center text-gray-900 mb-4">
            3D CAD Modeling,{'\n'}Powered by Voice
          </Text>
          <Text className="text-lg text-center text-gray-600 mb-8">
            Design and create 3D models naturally using voice commands
          </Text>
          <View className="flex-row justify-center space-x-4">
            <Link href="/register" asChild>
              <Pressable className="bg-blue-600 px-6 py-3 rounded-lg">
                <Text className="text-white font-semibold">Get Started</Text>
              </Pressable>
            </Link>
            <Link href="/projects" asChild>
              <Pressable className="bg-gray-200 px-6 py-3 rounded-lg">
                <Text className="text-gray-800 font-semibold">View Demo</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        {/* Video Demo Section */}
        {VideoSection && <VideoSection />}

        {/* Stats Section */}
        <View className="flex-row justify-around py-8 bg-white px-6">
          {stats.map((stat, index) => (
            <View key={index} className="items-center">
              <Text className="text-2xl font-bold text-gray-900">{stat.number}</Text>
              <Text className="text-sm text-gray-600">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Features Section */}
        <View className="px-6 py-12">
          <Text className="text-2xl font-bold text-center text-gray-900 mb-8">
            Key Features
          </Text>
          <View className="space-y-6">
            {features.map((feature, index) => (
              <View
                key={index}
                className="flex-row items-start space-x-4 bg-gray-50 p-6 rounded-xl"
              >
                <MaterialCommunityIcons
                  name={feature.icon}
                  size={24}
                  color="#2563EB"
                  style={{ marginTop: 2 }}
                />
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </Text>
                  <Text className="text-gray-600">{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View className="px-6 py-12 bg-gray-50">
          <Text className="text-2xl font-bold text-center text-gray-900 mb-4">
            Ready to Get Started?
          </Text>
          <Text className="text-center text-gray-600 mb-8">
            Join thousands of designers using VoiceCAD today
          </Text>
          <View className="flex-row justify-center">
            <Link href="/register" asChild>
              <Pressable className="bg-blue-600 px-8 py-4 rounded-lg">
                <Text className="text-white font-semibold text-lg">Start Free Trial</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
