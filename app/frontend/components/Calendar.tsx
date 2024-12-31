import { View, Text, Pressable } from 'react-native';
import { Card } from './Card';
import { ChevronLeftIcon, ChevronRightIcon } from '@expo/vector-icons/MaterialCommunityIcons';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

export function Calendar({ selectedDate = new Date(), onDateSelect }: CalendarProps) {
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Create calendar grid
  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDayOfMonth + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) return null;
    return dayNumber;
  });

  return (
    <Card>
      <View className="flex-row justify-between items-center mb-4">
        <ChevronLeftIcon name="chevron-left" size={24} color="#666" />
        <Text className="text-lg font-semibold">
          {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <ChevronRightIcon name="chevron-right" size={24} color="#666" />
      </View>

      <View className="flex-row justify-between mb-2">
        {weekDays.map(day => (
          <Text key={day} className="text-gray-500 text-center w-8">
            {day}
          </Text>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {days.map((day, index) => (
          <Pressable
            key={index}
            className={`w-8 h-8 items-center justify-center rounded-full mb-1
              ${day === selectedDate.getDate() ? 'bg-blue-500' : ''}`}
            onPress={() => day && onDateSelect?.(new Date(currentYear, currentMonth, day))}
          >
            {day && (
              <Text
                className={`text-sm
                  ${day === selectedDate.getDate() ? 'text-white font-bold' : 'text-gray-700'}`}
              >
                {day}
              </Text>
            )}
          </Pressable>
        ))}
      </View>
    </Card>
  );
} 