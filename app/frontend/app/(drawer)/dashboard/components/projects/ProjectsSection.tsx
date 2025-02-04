import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { Link } from 'expo-router';
import { useApi } from '../../../../../services/api';
import { listProjectsInOrganization, getUserDetailsWithOrganizations } from '../../../../../client/sdk.gen';
import type { ListProjectsInOrganizationResponses } from '../../../../../client/types.gen';
import { SectionHeader } from '../SectionHeader';
import { ProjectActions } from './ProjectActions';
import { NewDialog } from './NewDialog';

type Project = ListProjectsInOrganizationResponses['200'][number];

interface ProjectsSectionProps {}

export const ProjectsSection = ({}: ProjectsSectionProps) => {
  const { auth } = useApi();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);

  const loadProjects = async () => {
    try {
      const user = await getUserDetailsWithOrganizations();
      if (!user?.data?.organizations?.[0]?.id) return;

      const organizationId = user.data.organizations[0].id;
      const response = await listProjectsInOrganization({
        path: { organizationId }
      });
      
      if (response.data) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  if (loading) {
    return (
      <View className="p-4">
        <Text>Loading projects...</Text>
      </View>
    );
  }

  return (
    <>
      <SectionHeader 
        title="Projects" 
        action={
          <ProjectActions 
            onSuccess={loadProjects}
            onNewProject={() => setShowNewProjectDialog(true)}
          />
        }
      />
      <View className="flex-row flex-wrap gap-4 p-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/dashboard/${project.id}`}
            asChild
          >
            <Pressable className="w-64 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex-row">
              <View className="flex-1 py-2 px-3">
                <Text className="font-medium text-gray-900">{project.name}</Text>
                <Text className="text-sm text-gray-500">{project.description}</Text>
                <Text className="text-xs text-gray-400 mt-0.5">
                  Modified {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'Never'}
                </Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </View>

      {showNewProjectDialog && (
        <NewDialog
          onClose={() => setShowNewProjectDialog(false)}
          onSuccess={() => {
            setShowNewProjectDialog(false);
            loadProjects();
          }}
        />
      )}
    </>
  );
}; 