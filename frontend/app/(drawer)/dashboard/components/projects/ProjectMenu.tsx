import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Delete } from './Delete';

interface ProjectMenuProps {
  projectId: string;
  onSuccess: () => void;
}

export function ProjectMenu({ projectId, onSuccess }: ProjectMenuProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <View className="absolute right-2 top-2">
      <TouchableOpacity 
        className="p-1 rounded-full hover:bg-gray-100"
        onPress={() => setShowMenu(!showMenu)}
      >
        <Ionicons name="ellipsis-vertical" size={16} color="#666666" />
      </TouchableOpacity>

      {showMenu && (
        <View className="absolute right-0 top-8 bg-white shadow-lg rounded-lg border border-gray-200 py-1 min-w-[120px] z-20">
          <Delete 
            projectId={projectId} 
            onSuccess={() => {
              setShowMenu(false);
              onSuccess();
            }} 
          />
        </View>
      )}
    </View>
  );
} 