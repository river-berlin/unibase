import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { useState } from 'react';

import { CommandTabs } from '../../../components/CommandTabs';
import { ThreeRenderer } from '../../../components/ThreeRenderer';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

interface OpenSCADState {
  code: string;
  isLoading: boolean;
  error: string | null;
}

export default function ProjectPage() {
  const { id } = useLocalSearchParams();
  const [scadState, setScadState] = useState<OpenSCADState>({
    code: '',
    isLoading: false,
    error: null,
  });

  const handleModifyOpenSCAD = async (instructions: string) => {
    setScadState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/files/modify-scad`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scadContent: scadState.code,
          instructions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to modify OpenSCAD file');
      }

      const { modifiedCode } = await response.json();
      setScadState(prev => ({ 
        ...prev, 
        code: modifiedCode,
        isLoading: false 
      }));
    } catch (error) {
      setScadState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false 
      }));
    }
  };

  return (
    <View className="flex flex-1 flex-row">
      <View className="flex-1 border-r border-[#e0e0e0]">
        <CommandTabs 
          projectId={id as string} 
          scadState={scadState}
          onModifyOpenSCAD={handleModifyOpenSCAD}
        />
      </View>
      <View className="flex-1">
        <ThreeRenderer 
          projectId={id as string}
          scadCode={scadState.code}
        />
      </View>
    </View>
  );
}