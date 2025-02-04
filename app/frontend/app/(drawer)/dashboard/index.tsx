import { View, ScrollView } from 'react-native';
import { FoldersSection } from './components/folders/FoldersSection';
import { ProjectsSection } from './components/projects/ProjectsSection';

const DashboardPage = () => {
  return (
    <View className="flex-1">
      <View className="flex-1 bg-gray-50 overflow-scroll">
        <View className="min-h-full">
          <FoldersSection />
          <ProjectsSection />
        </View>
      </View>
    </View>
  );
};

export default DashboardPage;