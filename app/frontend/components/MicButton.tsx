import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface MicButtonProps {
  onPress?: () => void;
}

export function MicButton({ onPress }: MicButtonProps) {
  const [isActive, setIsActive] = useState(false);

  const handlePress = () => {
    setIsActive(!isActive);
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`p-3 rounded-full ${isActive ? 'bg-purple-600' : 'bg-gray-200'}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <MaterialCommunityIcons
        name={isActive ? 'microphone' : 'microphone-outline'}
        size={24}
        color={isActive ? '#ffffff' : '#4f46e5'}
      />
    </TouchableOpacity>
  );
} 