import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStlData } from '~/app/atoms';

interface DownloadSTLProps {
  projectId: string;
}

export function DownloadSTL({ projectId }: DownloadSTLProps) {
  const {stlData} = useStlData()
  if (!stlData) return null;

  const handleDownload = () => {
    // Create a blob from the STL string
    const blob = new Blob([stlData], { type: 'application/vnd.ms-pki.stl' });
    
    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `model_${projectId}.stl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <TouchableOpacity
      className="justify-center px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 flex-row items-center w-fit"
      onPress={handleDownload}
    >
      <Ionicons name="download-outline" size={14} color="#666666" />
      <Text className="text-xs text-gray-600 ml-1">Download STL</Text>
    </TouchableOpacity>
  );
} 