import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { createCheckoutSession, createPortalSession } from '../../../client/sdk.gen';

const BillingHistory = [
  { id: 1, date: '2024-03-15', amount: '$9.99', period: '1 month' },
  { id: 2, date: '2024-02-15', amount: '$9.99', period: '1 month' },
  { id: 3, date: '2024-01-15', amount: '$9.99', period: '1 month' },
];

export default function BillingScreen() {
  // Example usage - replace with actual data
  const daysRemaining = 12; // Calculate from subscription end date
  const totalDays = 30;
  const percentageUsed = ((totalDays - daysRemaining) / totalDays) * 100;

  const handleSubscribe = async () => {
    try {
      const response = await createCheckoutSession({});
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await createPortalSession({});
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Failed to create portal session:', error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Billing Header */}
      <View className="px-4 py-3 border-b border-gray-200">
        <Text className="text-xl font-semibold">Billing</Text>
      </View>

      <View className="p-4">
        {/* Subscription Status */}
        <View className="mb-6 mt-4">
          <Text className="text-lg mb-4">Subscription Status</Text>
          <View className="border border-gray-200 bg-white p-4 rounded-lg">
            <Text className="text-base font-semibold">
              {daysRemaining} days remaining
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              $5/month
            </Text>
            
            {/* Subscription Buttons */}
            <View className="mt-4 flex-row gap-2">
              <Pressable 
                className="bg-black px-4 py-2 rounded-lg"
                onPress={handleSubscribe}
              >
                <Text className="text-white text-center">
                  Subscribe
                </Text>
              </Pressable>
              
              <Pressable 
                className="bg-gray-200 px-4 py-2 rounded-lg"
                onPress={handleManageSubscription}
              >
                <Text className="text-black text-center">
                  Manage Subscription
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Billing History */}
        <View className="mb-6 mt-10">
          <Text className="text-lg mb-4">Billing History</Text>
          
          {/* Table Header */}
          <View className="flex-row border border-gray-200 bg-white p-3 rounded-t-lg">
            <Text className="flex-1 font-semibold">Date</Text>
            <Text className="flex-1 font-semibold">Amount</Text>
            <Text className="flex-1 font-semibold">Period</Text>
            <View className="w-8" />
          </View>

          {/* Table Rows */}
          {BillingHistory.map((item) => (
            <View 
              key={item.id} 
              className="flex-row border-b border-l border-r border-gray-200 bg-white p-3"
            >
              <Text className="flex-1">{item.date}</Text>
              <Text className="flex-1">{item.amount}</Text>
              <Text className="flex-1">{item.period}</Text>
              <Pressable 
                onPress={() => {}} 
                className="w-8"
              >
                <FontAwesome name="download" size={16} color="#0284C7" />
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
} 