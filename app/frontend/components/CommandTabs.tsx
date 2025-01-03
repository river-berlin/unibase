import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MicButton } from './MicButton';

interface OpenSCADState {
  code: string;
  isLoading: boolean;
  error: string | null;
}

interface CommandTabsProps {
  projectId: string;
  scadState: OpenSCADState;
  onModifyOpenSCAD: (instructions: string) => Promise<void>;
}

export function CommandTabs({ projectId, scadState, onModifyOpenSCAD }: CommandTabsProps) {
  const [activeTab, setActiveTab] = useState<'command' | 'code'>('command');
  const [commandText, setCommandText] = useState('');

  const handleMicPress = () => {
    // TODO: Implement voice input logic
    console.log('Mic pressed');
  };

  const handleCommandSubmit = async () => {
    if (!commandText.trim()) return;
    
    try {
      await onModifyOpenSCAD(commandText);
      setCommandText('');
    } catch (error) {
      console.error('Error submitting command:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Content Area */}
      <View style={styles.content}>
        {activeTab === 'command' ? (
          <View style={styles.commandContainer}>
            <TextInput
              style={styles.commandInput}
              value={commandText}
              onChangeText={setCommandText}
              multiline
              placeholder="Type or speak your CAD commands here..."
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!scadState.isLoading}
            />
            <View style={styles.commandControls}>
              <MicButton onPress={handleMicPress} disabled={scadState.isLoading} />
              {scadState.isLoading ? (
                <View style={styles.submitButton}>
                  <ActivityIndicator color="#fff" />
                </View>
              ) : (
                <Pressable 
                  onPress={handleCommandSubmit}
                  style={styles.submitButton}
                  disabled={!commandText.trim()}
                >
                  <MaterialCommunityIcons 
                    name="send" 
                    size={24} 
                    color={commandText.trim() ? '#fff' : '#ccc'} 
                  />
                </Pressable>
              )}
            </View>
            {scadState.error && (
              <Text style={styles.errorText}>{scadState.error}</Text>
            )}
          </View>
        ) : (
          <TextInput
            style={styles.codeEditor}
            value={scadState.code}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            editable={false}
          />
        )}
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <Pressable 
          style={[styles.tab, activeTab === 'command' && styles.activeTab]}
          onPress={() => setActiveTab('command')}
        >
          <MaterialCommunityIcons 
            name="console" 
            size={24} 
            color={activeTab === 'command' ? '#4f46e5' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'command' && styles.activeTabText
          ]}>Command</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'code' && styles.activeTab]}
          onPress={() => setActiveTab('code')}
        >
          <MaterialCommunityIcons 
            name="code-braces" 
            size={24} 
            color={activeTab === 'code' ? '#4f46e5' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'code' && styles.activeTabText
          ]}>OpenSCAD</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  commandContainer: {
    flex: 1,
    position: 'relative',
  },
  commandInput: {
    flex: 1,
    color: '#333',
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  commandControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  codeEditor: {
    flex: 1,
    color: '#333',
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#4f46e5',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 8,
    paddingHorizontal: 12,
  },
}); 