import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThreeRenderer } from '../../../components/ThreeRenderer';
import { CommandTabs } from './components/CommandTabs';
import { generateObjects, getProjectStl } from '../../../client/sdk.gen';

interface GenerateResponse {
  json: {
    objects: any[];
    scene: { rotation: { x: number; y: number; z: number } };
  };
  reasoning: string;
  messageId: string;
  stl: string;
  scad: string;
  errors?: string[];
  toolCalls?: {
    name: string;
    args: any;
    result?: any;
    error?: string;
  }[];
}

interface StlResponse {
  stl: string;
}

export default function ProjectPage() {
  const { id } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stlData, setStlData] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [toolErrors, setToolErrors] = useState<string[] | null>(null);
  const [toolCalls, setToolCalls] = useState<GenerateResponse['toolCalls']>(null);
  const [scadData, setScadData] = useState<string | null>(null);

  useEffect(() => {
    const fetchExistingStl = async () => {
      try {
        const response = await getProjectStl({
          path: { projectId: id.toString() }
        });

        if (response.data) {
          const data = response.data as StlResponse;
          if (data.stl) {
            setStlData(data.stl);
          }
        }
      } catch (err) {
        console.error('Error fetching existing STL:', err);
      }
    };

    fetchExistingStl();
  }, [id]);

  const handleGenerateObjects = async (instructions: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setReasoning(null);
      setToolErrors(null);
      setToolCalls(null);
      const response = await generateObjects({
        body: { instructions },
        path: { projectId: id.toString() }
      });
      if (response.data) {
        const data = response.data as GenerateResponse;
        setStlData(data.stl);
        setScadData(data.scad);
        setReasoning(data.reasoning);
        if (data.errors) {
          setToolErrors(data.errors);
        }
        if (data.toolCalls) {
          setToolCalls(data.toolCalls);
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white flex-row">
      <CommandTabs
        projectId={id as string}
        isLoading={isLoading}
        error={error}
        toolErrors={toolErrors}
        toolCalls={toolCalls}
        reasoning={reasoning}
        scadData={scadData}
        onGenerateObjects={handleGenerateObjects}
      />
      <View className="flex-1">
        <ThreeRenderer stlData={stlData} />
      </View>
    </View>
  );
}