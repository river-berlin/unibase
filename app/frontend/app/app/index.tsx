import "@expo/metro-runtime";
import { View, Text, Image } from 'react-native';
import { A as expoA } from '@expo/html-elements';
import { styled } from "nativewind";
import { NavBar } from "../components/NavBar";
import {  useFonts, Caveat_400Regular } from '@expo-google-fonts/caveat';

const A = styled(expoA)

const backgroundDetails = require('../../assets/backgrounds/details.json');

const Background = () => {
  return (
    <Image
      source={require('../../assets/backgrounds/1.jpg')}
      className="!w-full !h-full bg-white absolute left-0 top-0 -z-30"
      resizeMode="cover"
    >
    </Image>
  );
};

const SectionOne = () => {
  let [fontsLoaded] = useFonts({
    Caveat_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View className="w-full h-max flex flex-row flex-grow justify-center mt-[120px] items-center">
      <Image
        className="!w-[640px] !h-[360px] relative bg-white hover:bg-gray-100 text-black font-semibold border border-gray-400 rounded-lg shadow relative left-[20px] top-[100px]"
        source={require('../../assets/jupyterlab-show.png')}
      />
      <View className="m-[15px] relative right-[100px] bottom-[50px] flex items-center" >
        <Text className="text-black text-6xl font-regular text-left relative text-black font-semibold rounded-lg p-[30px] bg-opacity-50" style={{ fontFamily: 'Caveat_400Regular'}}>
          Easy, Cheap <br/>GPU-powered <br/> Jupyter Notebooks
          <br />
          <ul className="mt-[20px]" >
            <li className="text-lg">- Style it, play it, and just use it</li>
            <li className="text-lg">- GPUs starting from 0.5$/hour</li>
          </ul>
        </Text>
        <button
                type="button"
                className="relative bg-white hover:bg-gray-100 text-blue-600 font-semibold py-2 px-0 border border-blue-600 rounded-lg shadow w-3/4"
              >
                Get started
        </button>
      </View>
    </View>
  );
};

const Sections = () => {
  return (
    <View className="flex flex-col">
      <SectionOne />
    </View>
  )
}

export default function App() {
  return (
    <View className="flex w-full h-full">
      <Background />
      <View className="absolute inset-0 bg-white/70 -z-20 " />

      <View className="flex flex-col w-full h-full">
        <NavBar />
        <Sections />
      </View>
    </View>
  );
}
