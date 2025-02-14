import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ToolCalls } from './ToolCalls'; 

interface ReasoningProps {
  title: string;
  content: Array<{
    type: string;
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
  defaultExpanded?: boolean;
  toolCalls: Array<any>;
}

export function Message({ title, content, defaultExpanded = true, toolCalls }: ReasoningProps) {
  return (
    <View>
      {content.map((item, index) => {
        if (item.type === 'text' && item.text) {
          return <Text key={index}>{item.text}</Text>;
        }
        if (item.type === 'image_url' && item.image_url?.url) {
          return (
            <Image
              key={index}
              source={{ uri: item.image_url.url }}
              style={{ width: 100, height: 100 }}
            />
          );
        }
        return null;
      })}
    </View>
  );
}