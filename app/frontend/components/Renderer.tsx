import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface RendererProps {
  projectId: string;
}

export function Renderer({ projectId }: RendererProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implement project content loading logic
    const loadProjectContent = async () => {
      try {
        setLoading(true);
        // Fetch project content here
        setLoading(false);
      } catch (err) {
        setError('Failed to load project content');
        setLoading(false);
      }
    };

    loadProjectContent();
  }, [projectId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading project content...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>Project Renderer</Text>
      </View>
      <View style={styles.content}>
        <Text>Project content will be rendered here</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  toolbar: {
    height: 50,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  toolbarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
}); 