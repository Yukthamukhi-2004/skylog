import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Analysis() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-3xl font-bold text-[#1e90ff] tracking-tight">
          Analysis
        </Text>
        <Text className="text-gray-500 text-sm mt-1">
          Climate and weather insights
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-gray-400 text-base text-center">
          Analysis features coming soon.
        </Text>
      </View>
    </SafeAreaView>
  );
}
