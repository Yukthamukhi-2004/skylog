import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { WeatherBriefSkeleton } from "../SkeletonLoaders";

interface Props {
  brief: string;
  loading: boolean;
}

export default function WeatherBrief({ brief, loading }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [brief]);

  if (loading) {
    return <WeatherBriefSkeleton />;
  }

  if (!brief) return null;

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className="bg-[#1e90ff]/10 rounded-2xl p-4 mb-4 border border-[#1e90ff]/20"
    >
      <View className="flex-row items-center mb-2">
        <View className="w-7 h-7 rounded-full bg-[#1e90ff] items-center justify-center mr-2">
          <Text className="text-white text-xs">📋</Text>
        </View>
        <Text className="text-gray-900 text-base font-bold">Today's Brief</Text>
      </View>
      <Text className="text-sm text-gray-700 leading-6 ml-9">{brief}</Text>
    </Animated.View>
  );
}
