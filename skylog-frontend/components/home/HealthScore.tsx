import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { HealthInsight } from "../../hooks/useHomeScreenData";

interface Props {
  insights: HealthInsight[];
}

function InsightCard({ insight, index }: { insight: HealthInsight; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: index * 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay: index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const bgColor =
    insight.type === "warning"
      ? "bg-amber-50 border-amber-200"
      : insight.type === "positive"
        ? "bg-green-50 border-green-200"
        : "bg-blue-50 border-blue-200";

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      className={`rounded-xl p-3.5 mb-2 border ${bgColor} flex-row items-start`}
    >
      <Text className="text-lg mr-3 mt-0.5">{insight.icon}</Text>
      <View className="flex-1">
        <Text className="text-xs font-semibold text-gray-700 uppercase mb-0.5">
          {insight.type === "warning" ? "⚠️ Advisory" : insight.type === "positive" ? "✅ Tip" : "ℹ️ Note"}
        </Text>
        <Text className="text-sm text-gray-700 leading-5">{insight.message}</Text>
      </View>
    </Animated.View>
  );
}

export default function HealthScore({ insights }: Props) {
  if (insights.length === 0) return null;

  return (
    <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
      <View className="flex-row items-center mb-3">
        <View className="w-7 h-7 rounded-full bg-[#1e90ff] items-center justify-center mr-2">
          <Text className="text-white text-xs">❤️</Text>
        </View>
        <Text className="text-gray-900 text-base font-bold">
          Your Health & Weather
        </Text>
      </View>

      {insights.map((insight, idx) => (
        <InsightCard key={idx} insight={insight} index={idx} />
      ))}
    </View>
  );
}
