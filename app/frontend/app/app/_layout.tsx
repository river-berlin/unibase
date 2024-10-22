import { Stack } from 'expo-router/stack';
import "../global.css"

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
}