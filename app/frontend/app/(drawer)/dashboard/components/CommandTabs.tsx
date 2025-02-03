import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';

interface CommandTabsProps {
  projectId: string;
  isLoading: boolean;
  error: string | null;
  toolErrors: string[] | null;
  toolCalls: {
    name: string;
    args: any;
    result?: any;
    error?: string;
  }[] | null;
  reasoning: string | null;
  scadData: string | null;
  onGenerateObjects: (instructions: string) => Promise<void>;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
}

function CollapsibleSection({ title, children }: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <View className="mb-4">
      <TouchableOpacity 
        className="flex-row items-center justify-between bg-gray-100 p-2 rounded-t"
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text className="text-sm font-medium text-gray-700">{title}</Text>
        <Text>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      {isExpanded && (
        <View className="border border-t-0 border-gray-200 rounded-b p-3">
          {children}
        </View>
      )}
    </View>
  );
}

export function CommandTabs({ 
  projectId, 
  isLoading, 
  error, 
  toolErrors, 
  toolCalls, 
  reasoning, 
  scadData,
  onGenerateObjects 
}: CommandTabsProps) {
  const [instruction, setInstruction] = useState('');

  return (
    <View className="w-[300px] h-full border-r border-[#e0e0e0] bg-white p-4">
      <View className="flex flex-col h-full">
        {/* Input Section */}
        <View className="mb-4">
          <TextInput
            className="w-full p-2 border border-[#e0e0e0] rounded mb-2"
            placeholder="Enter instructions..."
            value={instruction}
            onChangeText={setInstruction}
            editable={!isLoading}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            className={`px-4 py-2 rounded ${isLoading ? 'bg-gray-400' : 'bg-blue-500'}`}
            onPress={() => !isLoading && onGenerateObjects(instruction)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-center">Generate</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Errors Sections */}
        {error && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Errors:</Text>
            <View className="border border-red-200 bg-red-50 rounded p-3">
              <Text className="text-red-600">{error}</Text>
            </View>
          </View>
        )}

        {toolErrors && toolErrors.length > 0 && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Tool Execution Errors:</Text>
            <View className="border border-yellow-200 bg-yellow-50 rounded p-3">
              {toolErrors.map((error, index) => (
                <Text key={index} className="text-yellow-800">{error}</Text>
              ))}
            </View>
          </View>
        )}

        <ScrollView className="flex-1">
          {/* Reasoning Section */}
          {reasoning && (
            <CollapsibleSection title="Reasoning">
              <Text className="text-sm text-gray-600">{reasoning}</Text>
            </CollapsibleSection>
          )}

          {/* Tool Calls Section */}
          {toolCalls && toolCalls.length > 0 && (
            <CollapsibleSection title="Tool Calls">
              {toolCalls.map((call, index) => (
                <View key={index} className="mb-3 last:mb-0">
                  <Text className="text-sm font-medium text-blue-600">{call.name}</Text>
                  <Text className="text-xs text-gray-600">Args: {JSON.stringify(call.args)}</Text>
                  {call.result && (
                    <Text className="text-xs text-green-600">Result: {JSON.stringify(call.result)}</Text>
                  )}
                  {call.error && (
                    <Text className="text-xs text-red-600">Error: {call.error}</Text>
                  )}
                </View>
              ))}
            </CollapsibleSection>
          )}

          {/* OpenSCAD Section */}
          {scadData && (
            <CollapsibleSection title="OpenSCAD Code">
              <ScrollView className="max-h-[200px]">
                <Text className="text-xs font-mono">{scadData}</Text>
              </ScrollView>
            </CollapsibleSection>
          )}
        </ScrollView>
      </View>
    </View>
  );
} 