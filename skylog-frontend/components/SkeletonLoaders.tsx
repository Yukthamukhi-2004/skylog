import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

/**
 * Reusable shimmer skeleton loader
 * Use as a wrapper around placeholder boxes
 */
export function SkeletonLoader({
  children,
  height = 16,
  width = "100%",
}: {
  children?: React.ReactNode;
  height?: number;
  width?: string | number;
}) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: shimmerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.4, 1],
        }),
        width,
        height,
      }}
      className="bg-gray-300 rounded"
    >
      {children}
    </Animated.View>
  );
}

/**
 * Weather Brief loading skeleton
 */
export function WeatherBriefSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
      <View className="flex-row items-center mb-3">
        <View className="w-7 h-7 rounded-full bg-gray-300 mr-2" />
        <SkeletonLoader height={16} width="40%" />
      </View>
      <View className="space-y-2">
        <SkeletonLoader height={14} width="100%" />
        <SkeletonLoader height={14} width="95%" />
        <SkeletonLoader height={14} width="90%" />
      </View>
    </View>
  );
}

/**
 * Current weather card skeleton
 */
export function CurrentWeatherSkeleton() {
  return (
    <View className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-3xl p-6 mb-6">
      {/* Temperature section */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <SkeletonLoader height={48} width="30%" />
          <SkeletonLoader height={14} width="40%" />
        </View>
        <View className="w-20 h-20 rounded-full bg-gray-300" />
      </View>

      {/* Details grid */}
      <View className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <View key={i} className="bg-white/50 rounded-xl p-3">
            <SkeletonLoader height={12} width="50%" />
            <SkeletonLoader height={16} width="60%" />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Hourly timeline skeleton
 */
export function HourlyTimelineSkeleton() {
  return (
    <View className="mb-6">
      <SkeletonLoader height={16} width="35%" />
      <View className="flex-row mt-4 space-x-3 px-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} className="items-center">
            <SkeletonLoader height={12} width={40} />
            <View className="w-10 h-24 bg-gray-300 rounded my-2" />
            <SkeletonLoader height={12} width={40} />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Day forecast card skeleton
 */
export function DayCardSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-200 flex-row items-center justify-between">
      <View className="flex-1">
        <SkeletonLoader height={14} width="30%" />
        <SkeletonLoader height={12} width="25%" />
      </View>
      <View className="w-12 h-12 rounded-full bg-gray-300" />
      <View className="flex-1 items-end">
        <SkeletonLoader height={14} width="30%" />
        <SkeletonLoader height={12} width="25%" />
      </View>
    </View>
  );
}

/**
 * Full page loading skeleton (shows multiple sections loading)
 */
export function PageLoadingSkeleton() {
  return (
    <View className="px-4 pt-4">
      <WeatherBriefSkeleton />
      <CurrentWeatherSkeleton />
      <HourlyTimelineSkeleton />
      <View className="space-y-3">
        <SkeletonLoader height={16} width="35%" />
        {[1, 2, 3].map((i) => (
          <DayCardSkeleton key={i} />
        ))}
      </View>
    </View>
  );
}
