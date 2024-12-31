import { View, Text } from 'react-native';
import { Card } from './Card';
import { LineChart } from './LineChart';

interface StatsCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    timeframe: string;
  };
  data?: number[];
  type?: 'line' | 'bar';
}

export function StatsCard({ title, value, change, data, type = 'line' }: StatsCardProps) {
  return (
    <Card>
      <Text className="text-gray-600 text-sm mb-2">{title}</Text>
      <Text className="text-3xl font-bold mb-1">{value}</Text>
      {change && (
        <Text className="text-gray-500 text-sm mb-4">
          {change.value} {change.timeframe}
        </Text>
      )}
      {data && (
        <View className="h-16">
          <LineChart data={data} />
        </View>
      )}
    </Card>
  );
} 