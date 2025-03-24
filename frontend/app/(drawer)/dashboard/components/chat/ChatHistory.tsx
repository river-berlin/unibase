import React from 'react';
import { ScrollView, View } from 'react-native';
import { ChatMessage } from './ChatMessage';
import { useChatMessages } from "~/app/atoms"

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tool_calls: any[] | null;
  tool_outputs: string | undefined;
  object_id: string | null;
  created_at: string;
  error: string | null;
}

export function ChatHistory() {
  const { messages } = useChatMessages();
  
  // Function to extract OpenSCAD code from message content or tool outputs
  const extractOpenScadCode = (message: Message): string | undefined => {
    // Check if this is an OpenSCAD tool response
    if (message.tool_calls && message.tool_calls.length > 0) {
      const openScadToolCall = message.tool_calls.find(
        tool => tool.function?.name?.includes('openscad') || tool.type?.includes('openscad')
      );
      
      if (openScadToolCall) {
        // Try to extract code from the tool call arguments
        try {
          const args = openScadToolCall.function?.arguments;
          if (args && typeof args === 'string') {
            const parsedArgs = JSON.parse(args);
            if (parsedArgs.code) return parsedArgs.code;
          }
        } catch (e) {
          console.error('Error parsing OpenSCAD tool call arguments:', e);
        }
      }
    }
    
    // Check if the message content contains OpenSCAD code blocks
    if (message.content) {
      try {
        // If content is a string, parse it to see if it's JSON
        const parsedContent = typeof message.content === 'string' 
          ? JSON.parse(message.content) 
          : message.content;
        
        // Look for OpenSCAD code in the content
        if (Array.isArray(parsedContent)) {
          for (const item of parsedContent) {
            if (item.type === 'openscad_code' && item.text) {
              return item.text;
            }
          }
        }
      } catch (e) {
        // If content is not JSON, check if it contains OpenSCAD code blocks
        const content = message.content.toString();
        const openScadMatch = content.match(/```(?:openscad|scad)([\s\S]*?)```/);
        if (openScadMatch && openScadMatch[1]) {
          return openScadMatch[1].trim();
        }
      }
    }
    
    // Check tool outputs for OpenSCAD code
    if (message.tool_outputs) {
      try {
        const outputs = JSON.parse(message.tool_outputs);
        if (outputs.openscad_code) {
          return outputs.openscad_code;
        }
      } catch (e) {
        // If tool_outputs is not JSON or doesn't have openscad_code
        console.error('Error parsing tool outputs:', e);
      }
    }
    
    return undefined;
  };

  // Convert atom messages to the expected Message format
  const formattedMessages = messages.map(msg => ({
    id: msg.id,
    role: msg.role === 'tool' ? 'assistant' : msg.role, // Map 'tool' role to 'assistant'
    content: msg.content,
    tool_calls: msg.tool_calls,
    tool_outputs: msg.tool_outputs,
    object_id: msg.object_id,
    created_at: msg.created_at,
    error: msg.error
  } as Message));

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="pb-4">
        {formattedMessages.toReversed().map((message) => {
          const openScadCode = extractOpenScadCode(message);
          
          return <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            toolCalls={message.tool_calls ? message.tool_calls : undefined}
            errors={message.error ? JSON.parse(message.error) : undefined}
            outputs={message.tool_outputs}
            openScadCode={openScadCode}
          />
        })}
      </View>
    </ScrollView>
  );
} 