import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { MicButton } from './MicButton';

interface TextEditorProps {
  projectId: string;
}

export function TextEditor({ projectId }: TextEditorProps) {
  const [text, setText] = useState(
    'This is a sample text editor.\nYou can write your project notes here.\n\nFeatures coming soon:\n- Syntax highlighting\n- Auto-completion\n- Real-time collaboration'
  );

  const handleMicPress = () => {
    // TODO: Implement voice input logic
    console.log('Mic pressed');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.editor}
        value={text}
        onChangeText={setText}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        textAlignVertical="top"
      />
      <View style={styles.micContainer}>
        <MicButton onPress={handleMicPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    position: 'relative',
  },
  editor: {
    flex: 1,
    padding: 16,
    paddingTop: 56,
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 14,
    lineHeight: 20,
  },
  micContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
}); 