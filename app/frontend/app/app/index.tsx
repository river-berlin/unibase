import "@expo/metro-runtime";
import { View, Text, Image, StyleSheet } from 'react-native';
import { Stack } from "expo-router";
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { A as expoA } from '@expo/html-elements';
import { StatusBar } from 'expo-status-bar';
import { styled } from "nativewind";
import { NavBar } from "../components/NavBar";

const A = styled(expoA)

const backgroundDetails = require('../../assets/backgrounds/details.json');

const Background = () => {
  return (
    <Image
      source={require('../../assets/backgrounds/1.jpg')}
      className="flex-1 justify-center items-center !w-full !h-full bg-white absolute left-0 top-0"
      resizeMode="cover"
    >
    </Image>
  );
};

const BigOverlay = () => {
  return (
    <View className="w-full h-full">
      <Text className="absolute text-white text-6xl font-regular text-right right-1/2 mr-[2px] bottom-1/2">
        Learn German<br />with flash cards
      </Text>
      <Image
        className="absolute !w-36 !h-36 left-1/2 ml-[2px] bottom-1/2"
        source={require('../../assets/1.webp')}
      />
    </View>
  );
};

function LogoTitle() {
  return (
    <Image style={styles.image} source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }} />
  );
}

export default function App() {
  return (
    <>
      <Stack.Screen
      
        options={{
          headerTitle: props => <LogoTitle {...props} />,
        }}
      />
      <NavBar />
      <View className="relative flex-1">
        <Background />
        <View className="absolute inset-0 top-20 flex items-center justify-center">
          <BigOverlay />
          <StatusBar style="auto" />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 50,
    height: 50,
  },
});