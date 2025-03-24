import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  className?: string;
}

export function Toggle({ value, onChange, label, className = '' }: ToggleProps) {
  return (
    <View className={`flex-row items-center py-1 ${className}`}>
      {label && <Text className="text-sm text-gray-600 mr-2">{label}</Text>}
      <Pressable 
        onPress={() => onChange(!value)}
      >
        <View 
          className={`w-[30px] h-4 rounded-full transition-all duration-200 ease-in-out ${value ? 'bg-black' : 'bg-gray-200'}`}
        >
          <View 
            className={`w-3 h-3 rounded-full bg-white shadow transition-all duration-200 ease-in-out transform 
              ${value ? 'translate-x-4' : 'translate-x-0.5'}`}
            style={{ marginTop: 2 }}
          />
        </View>
      </Pressable>
    </View>
  );
} 