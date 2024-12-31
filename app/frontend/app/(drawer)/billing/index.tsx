import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const BillingHistory = [
  { id: 1, date: '2024-03-15', amount: '$29.99', status: 'Paid' },
  { id: 2, date: '2024-02-15', amount: '$29.99', status: 'Paid' },
  { id: 3, date: '2024-01-15', amount: '$29.99', status: 'Paid' },
];

export default function BillingScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        {/* Current Plan */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-4">Current Plan</Text>
          <View className="bg-gray-50 p-4 rounded-lg">
            <Text className="text-base font-semibold">Pro Plan</Text>
            <Text className="text-gray-600">$29.99/month</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-4">Payment Methods</Text>
          <Pressable 
            className="flex-row justify-between items-center py-3 px-2 bg-gray-50 rounded-lg mb-2"
            onPress={() => {}}
          >
            <View className="flex-row items-center">
              <MaterialIcons name="credit-card" size={24} color="#666" />
              <Text className="text-base ml-2">•••• •••• •••• 4242</Text>
            </View>
            <Text className="text-sm text-gray-500">Default</Text>
          </Pressable>
          <Pressable 
            className="flex-row items-center py-3 px-2"
            onPress={() => {}}
          >
            <Ionicons name="add-circle-outline" size={24} color="#0284C7" />
            <Text className="text-sky-600 ml-2">Add Payment Method</Text>
          </Pressable>
        </View>

        {/* Billing History */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-4">Billing History</Text>
          
          {/* Table Header */}
          <View className="flex-row bg-gray-50 p-3 rounded-t-lg">
            <Text className="flex-1 font-semibold">Date</Text>
            <Text className="flex-1 font-semibold">Amount</Text>
            <Text className="flex-1 font-semibold">Status</Text>
            <View className="w-8" />
          </View>

          {/* Table Rows */}
          {BillingHistory.map((item) => (
            <View key={item.id} className="flex-row border-b border-gray-100 p-3">
              <Text className="flex-1">{item.date}</Text>
              <Text className="flex-1">{item.amount}</Text>
              <Text className="flex-1">{item.status}</Text>
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