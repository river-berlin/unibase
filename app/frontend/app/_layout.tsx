import {View} from "react-native";
import { Stack } from 'expo-router/stack';
import "./global.css"
import { Slot } from "expo-router";

export default function Layout() {
  return (<View className="inset-0">
    <Slot />
  </View>)
}