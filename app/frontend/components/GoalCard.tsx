import { View, Text, Pressable } from 'react-native';
import { Card } from './Card';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface GoalCardProps {
  title: string;
  subtitle: string;
  value: number;
  unit: string;
  data?: number[];
  onIncrease?: () => void;
  onDecrease?: () => void;
  onSetGoal?: () => void;
}

export function GoalCard({
  title,
  subtitle,
  value,
  unit,
  data = [],
  onIncrease,
  onDecrease,
  onSetGoal
}: GoalCardProps) {
  return (
    <Card>
      <Text className="text-xl font-bold mb-1">{title}</Text>
      <Text className="text-gray-500 text-sm mb-6">{subtitle}</Text>

      <View className="flex-row items-center justify-between mb-6">
        <Pressable
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          onPress={onDecrease}
        >
          <MaterialCommunityIcons name="minus" size={24} color="#374151" />
        </Pressable>

        <View className="items-center">
          <Text className="text-4xl font-bold">{value}</Text>
          <Text className="text-gray-500 text-sm uppercase">{unit}</Text>
        </View>

        <Pressable
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          onPress={onIncrease}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#374151" />
        </Pressable>
      </View>

      {data.length > 0 && (
        <View className="h-12 flex-row items-end justify-between mb-6">
          {data.map((value, index) => (
            <View
              key={index}
              style={{ height: `${(value / Math.max(...data)) * 100}%` }}
              className="bg-black w-2 rounded-full"
            />
          ))}
        </View>
      )}

      <Pressable
        className="bg-black py-3 rounded-lg items-center"
        onPress={onSetGoal}
      >
        <Text className="text-white font-semibold">Set Goal</Text>
      </Pressable>
    </Card>
  );
} 