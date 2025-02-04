import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useApi } from '../../../../../services/api';
import { listAllFoldersInOrganization, getUserDetailsWithOrganizations } from '../../../../../client/sdk.gen';
import { SectionHeader } from '../SectionHeader';
import { NewFolderDialog } from './NewFolderDialog';
import type { ListAllFoldersInOrganizationResponses } from '../../../../../client/types.gen';

type Folder = ListAllFoldersInOrganizationResponses['200'][number];

export const FoldersSection = () => {
  const { auth } = useApi();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);

  const loadFolders = async () => {
    const user = await getUserDetailsWithOrganizations();
    if (!user?.data?.organizations?.[0]?.id) return;
    
    const organizationId = user.data.organizations[0].id;
    const response = await listAllFoldersInOrganization({
      path: { organizationId }
    });
    
    if (response.data) {
      setFolders(response.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFolders();
  }, []);

  if (loading) {
    return (
      <View className="p-4">
        <Text>Loading folders...</Text>
      </View>
    );
  }

  return (
    <>
      <SectionHeader 
        title="Folders" 
        action={
          <Pressable
            className="px-2 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex-row items-center"
            onPress={() => setShowNewFolderDialog(true)}
          >
            <MaterialCommunityIcons name="folder-plus" size={16} color="#4b5563" />
            <Text className="ml-1 text-gray-700 text-sm">New Folder</Text>
          </Pressable>
        }
      />
      <View className="flex-row flex-wrap gap-4 p-4">
        {folders.map((folder) => (
          <Link
            key={folder.id}
            href={`/dashboard/${folder.id}`}
            asChild
          >
            <Pressable className="w-64 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex-row">
              <View className="flex-1 py-2 px-3">
                <Text className="font-medium text-gray-900">{folder.name}</Text>
                <Text className="text-xs text-gray-400 mt-0.5">
                  Modified {folder.updated_at ? new Date(folder.updated_at).toLocaleDateString() : 'Never'}
                </Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </View>

      {showNewFolderDialog && (
        <NewFolderDialog
          onClose={() => setShowNewFolderDialog(false)}
          onSuccess={() => {
            setShowNewFolderDialog(false);
            loadFolders();
          }}
        />
      )}
    </>
  );
}; 