import { View, Text, TextInput, Pressable } from 'react-native';
import { Card } from './Card';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

interface ChatSupportProps {
  supportName?: string;
  supportEmail?: string;
  onSendMessage?: (message: string) => void;
}

export function ChatSupport({ 
  supportName = 'Sofia Davis',
  supportEmail = 'm@example.com',
  onSendMessage 
}: ChatSupportProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi, how can I help you today?',
      sender: 'support',
      timestamp: new Date()
    }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    onSendMessage?.(message);
    setMessage('');
  };

  return (
    <Card>
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
          <Text className="text-gray-600 text-lg">
            {supportName.charAt(0)}
          </Text>
        </View>
        <View className="ml-3">
          <Text className="font-semibold">{supportName}</Text>
          <Text className="text-gray-500 text-sm">{supportEmail}</Text>
        </View>
      </View>

      <View className="space-y-4 mb-4">
        {messages.map(msg => (
          <View
            key={msg.id}
            className={`max-w-[80%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}
          >
            <View
              className={`rounded-2xl p-3 
                ${msg.sender === 'user' 
                  ? 'bg-blue-500 rounded-br-none' 
                  : 'bg-gray-100 rounded-bl-none'
                }`}
            >
              <Text
                className={msg.sender === 'user' ? 'text-white' : 'text-gray-800'}
              >
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View className="flex-row items-center bg-gray-50 rounded-lg p-2">
        <TextInput
          className="flex-1 min-h-[40px] px-2"
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <Pressable
          className="w-8 h-8 items-center justify-center"
          onPress={handleSend}
        >
          <MaterialCommunityIcons 
            name="send" 
            size={20} 
            color={message.trim() ? '#2563eb' : '#9ca3af'} 
          />
        </Pressable>
      </View>
    </Card>
  );
} 