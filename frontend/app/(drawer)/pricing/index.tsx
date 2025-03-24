import { View, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PricingPage = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      features: [
        { name: 'Up to 3 projects', included: true },
        { name: 'Basic support', included: true },
        { name: 'Community access', included: true },
        { name: 'Advanced features', included: false },
        { name: 'Priority support', included: false },
      ],
    },
    {
      name: 'Pro',
      price: '$10',
      features: [
        { name: 'Unlimited projects', included: true },
        { name: 'Priority support', included: true },
        { name: 'Advanced features', included: true },
        { name: 'API access', included: true },
        { name: 'Custom domain', included: false },
      ],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        { name: 'Everything in Pro', included: true },
        { name: 'Custom domain', included: true },
        { name: 'SLA', included: true },
        { name: 'Dedicated support', included: true },
        { name: 'Custom features', included: true },
      ],
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-row flex-wrap justify-center gap-4 p-4">
        {plans.map((plan) => (
          <View key={plan.name} className="bg-white rounded-xl p-6 shadow-md w-80">
            <Text className="text-2xl font-bold text-center">{plan.name}</Text>
            <Text className="text-3xl font-bold text-center text-blue-600 my-4">
              {plan.price}
            </Text>
            <View className="space-y-3">
              {plan.features.map((feature) => (
                <View key={feature.name} className="flex-row items-center space-x-2">
                  <MaterialCommunityIcons
                    name={feature.included ? 'check-circle' : 'close-circle'}
                    size={24}
                    color={feature.included ? '#16a34a' : '#dc2626'}
                  />
                  <Text className="text-gray-600">{feature.name}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default PricingPage; 