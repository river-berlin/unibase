import "@expo/metro-runtime";
import { View, Text, Image } from 'react-native';
import { A as expoA } from '@expo/html-elements';
import { StatusBar } from 'expo-status-bar';
import { styled } from "nativewind";
import { NavBar } from "./components/NavBar";
import {  useFonts, Caveat_400Regular } from '@expo-google-fonts/caveat';

const A = styled(expoA)

const SectionOne = () => {
  let [fontsLoaded] = useFonts({
    Caveat_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View className="w-full h-max flex flex-col-reverse md:flex-row flex-grow justify-center md:mt-[120px] items-center p-[30px]">
      <Image
        className="!w-[350px] !h-[196.88px] md:!w-[640px] md:!h-[360px] relative bg-white hover:bg-gray-100 text-black font-semibold border border-gray-400 rounded-lg shadow relative md:left-[20px] md:top-[100px]"
        source={require('../assets/jupyterlab-show.png')}
      />
      <View className="m-[15px] relative md:right-[100px] md:bottom-[50px] flex items-center md:items-start mb-[100px]" >
        <Text className="text-black text-6xl font-regular text-center md:text-left relative text-black font-semibold rounded-lg bg-opacity-50 pb-[30px]" style={{ fontFamily: 'Caveat_400Regular'}}>
          Easy, Cheap <br/>GPU-powered <br/> Jupyter Notebooks
          <br />
          <ul className="mt-[20px]" >
            <li className="text-lg">- Style it, play it, and just use it</li>
            <li className="text-lg">- GPUs starting from 0.5$/hour</li>
          </ul>
        </Text>
        <A
         className="relative bg-white hover:bg-gray-100 text-blue-600 font-semibold py-2 px-4 border border-blue-600 rounded-lg shadow w-max text-lg"
         href="/login"
              >
                Get started
        </A>
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
      <View className="inset-0 bg-white/70 -z-20 " />

      <View className="flex flex-col w-full h-full">
        <NavBar />
        <Sections />
      </View>
    </View>
  );
}
