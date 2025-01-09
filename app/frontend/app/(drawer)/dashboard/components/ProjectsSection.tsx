import { View, Text, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { Link } from 'expo-router';
import { Project, User } from '../../../../src/backend-js-api';
import { useApi } from '../../../../services/api';
import { useProjects } from '../../../../services/projects';
import { SectionHeader } from './SectionHeader';
import { ProjectActions } from './ProjectActions';

type UserWithOrg = User & { organizations: { id: string; name: string }[] };

interface ProjectsSectionProps {}

export const ProjectsSection = ({}: ProjectsSectionProps) => {
  const { auth } = useApi();
  const { projects: projectsApi } = useProjects();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      const user = await auth.getCurrentUser() as UserWithOrg;
      const organizationId = user.organizations[0].id;
      const projectsResponse = await projectsApi.getProjects(organizationId);
      setProjects(projectsResponse);
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
        action={<ProjectActions onSuccess={loadProjects} />}
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
                  Modified {new Date(project.updatedAt).toLocaleDateString()}
                </Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
    </>
  );
}; 