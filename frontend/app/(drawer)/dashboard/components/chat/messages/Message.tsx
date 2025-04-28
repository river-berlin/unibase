import { View, Text, Image } from 'react-native';
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

export function Message({ content, toolCalls }: ReasoningProps) {
  console.log("-- x -- content", content)
  return (
    <View>
      {content && content.map((item, index) => {
        if (item.type === 'text' && item.text) {
          return <Text key={index}>{item.text}</Text>;
        }
        if (item.type === 'image' && item.url) {
          return (
            <Image
              key={index}
              source={{ uri: item.url }}
              style={{ width: 100, height: 100 }}
            />
          );
        }
        return null;
      })}
      {toolCalls && toolCalls.map((toolCall, index) => (
        <ToolCalls functions={toolCall.tool_calls} />
      ))}
    </View>
  );
}