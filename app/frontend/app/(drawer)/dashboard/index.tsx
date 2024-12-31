import { ScrollView, View } from 'react-native';
import { StatsCard } from '../../../components/StatsCard';
import { Calendar } from '../../../components/Calendar';
import { GoalCard } from '../../../components/GoalCard';
import { TeamList } from '../../../components/TeamList';
import { ChatSupport } from '../../../components/ChatSupport';

export default function DashboardScreen() {
  const revenueData = [10, 8, 9, 7, 8, 9, 12];
  const subscriptionData = [80, 95, 75, 90, 70, 80, 95, 70];
  const activityData = [65, 75, 60, 80, 70, 85, 75, 70, 60, 80, 65, 75];

  const teamMembers = [
    {
      id: '1',
      name: 'Sofia Davis',
      email: 'm@example.com',
      role: 'Owner' as const,
    },
    {
      id: '2',
      name: 'Jackson Lee',
      email: 'p@example.com',
      role: 'Member' as const,
    },
    {
      id: '3',
      name: 'Isabella Nguyen',
      email: 'i@example.com',
      role: 'Member' as const,
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 space-y-4">
        {/* Stats Row */}
        <View className="flex-row space-x-4">
          <View className="flex-1">
            <StatsCard
              title="Total Revenue"
              value="$15,231.89"
              change={{ value: "+20.1%", timeframe: "from last month" }}
              data={revenueData}
            />
          </View>
          <View className="flex-1">
            <StatsCard
              title="Subscriptions"
              value="+2350"
              change={{ value: "+180.1%", timeframe: "from last month" }}
              data={subscriptionData}
              type="bar"
            />
          </View>
        </View>

        {/* Calendar and Goal Row */}
        <View className="flex-row space-x-4">
          <View className="flex-1">
            <Calendar />
          </View>
          <View className="flex-1">
            <GoalCard
              title="Move Goal"
              subtitle="Set your daily activity goal."
              value={350}
              unit="calories/day"
              data={activityData}
            />
          </View>
        </View>

        {/* Team and Chat Row */}
        <View className="flex-row space-x-4">
          <View className="flex-1">
            <TeamList members={teamMembers} />
          </View>
          <View className="flex-1">
            <ChatSupport />
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 