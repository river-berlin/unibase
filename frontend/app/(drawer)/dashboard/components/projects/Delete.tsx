import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deleteProjectAndAssociatedData } from '../../../../../client/sdk.gen';

interface DeleteProps {
  projectId: string;
  onSuccess: () => void;
}

export function Delete({ projectId, onSuccess }: DeleteProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteProjectAndAssociatedData({
        path: { projectId }
      });
      onSuccess();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <>
      <TouchableOpacity 
        className="flex-row items-center px-3 py-1.5 hover:bg-gray-50 w-full"
        onPress={() => setShowConfirm(true)}
      >
        <Ionicons name="trash-outline" size={16} color="#666666" className="mr-2" />
        <Text className="text-sm text-gray-700">Delete</Text>
      </TouchableOpacity>

      {showConfirm && (
        <View className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Pressable className="absolute inset-0" onPress={() => setShowConfirm(false)} />
          <View className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4 relative">
            <Text className="text-lg font-medium text-gray-900 mb-2">Delete Project?</Text>
            <Text className="text-sm text-gray-600 mb-6">This action cannot be undone. The project and all its associated data will be permanently deleted.</Text>
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity 
                className="px-4 py-2 rounded bg-gray-100"
                onPress={() => setShowConfirm(false)}
              >
                <Text className="text-sm text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="px-4 py-2 rounded bg-red-500"
                onPress={() => {
                  handleDelete();
                  setShowConfirm(false);
                }}
              >
                <Text className="text-sm text-white font-medium">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
} 