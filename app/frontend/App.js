import {View, Text, StyleSheet, ImageBackground, useWindowDimensions} from 'react-native';
import { A } from '@expo/html-elements';
import { StatusBar } from 'expo-status-bar';

const backgroundDetails = require('./assets/backgrounds/details.json')

const Attribution = ({ imageKey }) => {
  const background = backgroundDetails.backgrounds[imageKey];

  const { by, by_url, on, on_url } = background;

  return (
    <View style={styles.container}>
      <Text style={styles.attributionText}>
        Photo by{' '}
        <A href={by_url} style={styles.link}>
          {by}
        </A>{' '}
        on{' '}
        <A href={on_url} style={styles.link}>
          {on}
        </A>
      </Text>
    </View>
  );
};


export default function App() {
  const { width } = useWindowDimensions();

  return (
    <ImageBackground
      source={require('./assets/backgrounds/1.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Attribution imageKey={"1.jpg"} />
        <Text style={styles.text}>{backgroundDetails.backgrounds['1.jpg']['attribution-html']}</Text>
      </View>
      <StatusBar style="auto" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,  // Full-screen background
    justifyContent: 'center', // Center the content
    alignItems: 'center',
    width : "100%",
    height : "100%"
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    padding: 20,
    borderRadius: 10,
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  attributionText: {
    color: 'white',
    fontSize: 24,
  },
  link: {
    color: "blue"
  }
});
