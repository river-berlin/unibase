import {Text, View} from "react-native";
import { Stack } from 'expo-router/stack';
import { TopBar } from "../components/TopBar";
import "../global.css"
import { Slot } from "expo-router";

export default function Layout() {
  return <Stack
    screenOptions={{
      headerStyle: {
        backgroundColor: '#f4511e',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  />
  //return <Stack.Screen options={{'headerTitle': props => <Text>Abcdef</Text> }} />
  /* return (<View className="absolute inset-0">
    <TopBar />
    <Stack />
  </View>) */
}