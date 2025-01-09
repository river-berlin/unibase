import { View, Text } from 'react-native';

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export const SectionHeader = ({ title, action }: SectionHeaderProps) => (
  <View className="px-4 pt-6 pb-2">
    <View className="flex-row items-center">
      <Text className="mr-2 text-lg font-medium text-gray-900">{title}</Text>
      {action}
    </View>
  </View>
); 