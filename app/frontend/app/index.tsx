import "@expo/metro-runtime";
import { View, Text, Image } from 'react-native';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { A as expoA } from '@expo/html-elements';
import { StatusBar } from 'expo-status-bar';
import { styled } from "nativewind";

const A = styled(expoA)

const backgroundDetails = require('../assets/backgrounds/details.json');

const Attribution = ({ imageKey }) => {
  let [fontsLoaded] = useFonts({ Inter_400Regular });
  if (!fontsLoaded) return null;

  const background = backgroundDetails.backgrounds[imageKey];
  const { by, by_url, on, on_url } = background;

  return (
    <View className="p-4">
      <Text className="text-white text-base">
        Photo by{' '}
        <A href={by_url} className="text-blue-700">
          {by}
        </A>{' '}
        on{' '}
        <A href={on_url} className="text-blue-700">
          {on}
        </A>
      </Text>
    </View>
  );
};

const Background = () => {
  return (
    <Image
      source={require('../assets/backgrounds/1.jpg')}
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
        source={require('../assets/2.webp')}
      />
    </View>
  );
};

export default function App() {
  return (
    <View className="flex-1">
      <Background />
      <View className="absolute inset-0 bg-black/70" />
      <View className="absolute inset-0 flex items-center justify-center">
        <View className="absolute bottom-10 left-10 bg-black/50 p-5 rounded-lg">
          <Attribution imageKey={"1.jpg"} />
        </View>
        <BigOverlay />
        <StatusBar style="auto" />
      </View>
    </View>
  );
}
