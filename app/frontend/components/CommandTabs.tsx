import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Object3D } from 'backend-js-api/src/services/ProjectService';

interface CommandTabsProps {
  projectId: string;
  objects: Object3D[];
  isLoading: boolean;
  error: string | null;
  onGenerateObjects: (instructions: string) => Promise<void>;
}

export function CommandTabs({ projectId, objects, isLoading, error, onGenerateObjects }: CommandTabsProps) {
  const [activeTab, setActiveTab] = useState<'command' | 'objects'>('command');
  const [instruction, setInstruction] = useState('');
  const [primitivesExpanded, setPrimitivesExpanded] = useState(true);
  const [currentObjectExpanded, setCurrentObjectExpanded] = useState(true);

  const renderCodeContent = () => {
    if (activeTab === 'command') {
      return (
        <View style={styles.commandSection}>
          <View style={styles.inputSection}>
            <TextInput
              style={styles.input}
              value={instruction}
              onChangeText={setInstruction}
              placeholder="Enter your command..."
              multiline
            />
            <View style={styles.buttonContainer}>
              <Pressable 
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={() => !isLoading && onGenerateObjects(instruction)}
                disabled={isLoading}
              >
                <MaterialCommunityIcons 
                  name={isLoading ? "loading" : "arrow-right-circle"} 
                  size={16} 
                  color={isLoading ? "#666" : "#000"} 
                />
                <Text style={[styles.buttonText, isLoading && styles.buttonTextDisabled]}>
                  {isLoading ? 'Generating...' : 'Generate'}
                </Text>
              </Pressable>
            </View>
          </View>
          
          <View style={styles.outputSection}>
            <Text style={styles.sectionLabel}>Output & Status</Text>
            <ScrollView style={styles.reasoningScroll}>
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <Text style={styles.reasoningText}>
                  {isLoading ? 'Generating objects...' : 'Ready to generate objects.'}
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      );
    } else if (activeTab === 'objects') {
      return (
        <View style={styles.codeSection}>
          {Platform.OS === 'web' ? (
            <ScrollView style={styles.objectsScroll}>
              <View style={styles.objectGroup}>
                <Pressable 
                  style={styles.groupHeader}
                  onPress={() => setPrimitivesExpanded(!primitivesExpanded)}
                >
                  <MaterialCommunityIcons 
                    name={primitivesExpanded ? "chevron-down" : "chevron-right"} 
                    size={20} 
                    color="#666"
                  />
                  <Text style={styles.groupTitle}>Primitives</Text>
                </Pressable>
                {primitivesExpanded && (
                  <View style={styles.primitivesList}>
                    <Text style={styles.primitiveItem}>• Cube</Text>
                    <Text style={styles.primitiveItem}>• Sphere</Text>
                    <Text style={styles.primitiveItem}>• Cylinder</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.objectGroup}>
                <Pressable 
                  style={styles.groupHeader}
                  onPress={() => setCurrentObjectExpanded(!currentObjectExpanded)}
                >
                  <MaterialCommunityIcons 
                    name={currentObjectExpanded ? "chevron-down" : "chevron-right"} 
                    size={20} 
                    color="#666"
                  />
                  <Text style={styles.groupTitle}>Current Objects</Text>
                </Pressable>
                {currentObjectExpanded && (
                  <View style={styles.currentObjectContent}>
                    <SyntaxHighlighter language="json" style={oneLight}>
                      {JSON.stringify(objects || [], null, 2)}
                    </SyntaxHighlighter>
                  </View>
                )}
              </View>
            </ScrollView>
          ) : (
            <Text>{JSON.stringify(objects || [], null, 2)}</Text>
          )}
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderCodeContent()}
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
          style={[styles.tab, activeTab === 'objects' && styles.activeTab]}
          onPress={() => setActiveTab('objects')}
        >
          <MaterialCommunityIcons 
            name="code-json" 
            size={24} 
            color={activeTab === 'objects' ? '#4f46e5' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'objects' && styles.activeTabText
          ]}>Objects</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  commandSection: {
    flex: 1,
    gap: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  inputSection: {
    flex: 1,
    minHeight: 150,
    gap: 16,
    position: 'relative',
  },
  outputSection: {
    flex: 1,
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    paddingRight: 50,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    position: 'absolute',
    right: 8,
    bottom: 8,
  },
  button: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  buttonDisabled: {
    borderColor: '#ccc',
  },
  buttonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonTextDisabled: {
    color: '#666',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  codeSection: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  reasoningScroll: {
    flex: 1,
  },
  reasoningText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  objectsScroll: {
    flex: 1,
    padding: 16,
  },
  objectGroup: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  primitivesList: {
    paddingLeft: 28,
    paddingTop: 8,
    gap: 8,
  },
  primitiveItem: {
    fontSize: 14,
    color: '#4b5563',
  },
  currentObjectContent: {
    paddingLeft: 28,
    paddingTop: 8,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  activeTab: {
    backgroundColor: '#f3f4f6',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#4f46e5',
    fontWeight: '500',
  },
}); 