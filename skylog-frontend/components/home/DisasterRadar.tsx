import React, { useEffect, useRef } from "react";
import { Animated, FlatList, Text, TouchableOpacity, View } from "react-native";
import { DisasterAlert } from "../../hooks/useHomeScreenData";

interface Props {
  alerts: DisasterAlert[];
}

const TYPE_ICONS: Record<string, string> = {
  earthquake: "🌍",
  flood: "🌊",
  tsunami: "🌊",
  drought: "🏜️",
};

const SEVERITY_BG: Record<string, string> = {
  DANGER: "bg-red-50 border-red-200",
  EXTREME: "bg-red-50 border-red-200",
  WARNING: "bg-orange-50 border-orange-200",
  SEVERE: "bg-orange-50 border-orange-200",
  MODERATE: "bg-yellow-50 border-yellow-200",
  WATCH: "bg-yellow-50 border-yellow-200",
  INFO: "bg-blue-50 border-blue-200",
};

const SEVERITY_BADGE: Record<string, string> = {
  DANGER: "bg-red-500",
  EXTREME: "bg-red-500",
  WARNING: "bg-orange-500",
  SEVERE: "bg-orange-500",
  MODERATE: "bg-yellow-500",
  WATCH: "bg-yellow-500",
  INFO: "bg-blue-500",
};

function AlertItem({ item, index }: { item: DisasterAlert; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isCritical = item.severity === "DANGER" || item.severity === "EXTREME";

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      className={`rounded-xl p-3.5 mb-2.5 border ${
        SEVERITY_BG[item.severity] ?? "bg-gray-50 border-gray-200"
      } ${isCritical ? "border-l-4 border-l-red-500" : ""}`}
    >
      <View className="flex-row items-start">
        {/* Icon circle */}
        <View
          className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
            isCritical ? "bg-red-100" : "bg-white"
          }`}
        >
          <Text className="text-lg">
            {TYPE_ICONS[item.type] ?? "⚠️"}
          </Text>
        </View>

        <View className="flex-1">
          {/* Header row */}
          <View className="flex-row items-center mb-1">
            <Text className="text-sm font-bold text-gray-900 flex-1">
              {item.title}
            </Text>
            <View
              className={`px-2 py-0.5 rounded-full ${SEVERITY_BADGE[item.severity] ?? "bg-gray-400"}`}
            >
              <Text className="text-[10px] font-bold text-white uppercase">
                {item.severity}
              </Text>
            </View>
          </View>

          <Text className="text-xs text-gray-600 mb-1">
            📍 {item.location}
          </Text>

          <Text className="text-xs text-gray-500">{item.description}</Text>

          {item.distanceKm != null && (
            <View className="flex-row items-center mt-1.5">
              {item.distanceKm < 100 ? (
                <View className="px-2 py-0.5 rounded-full bg-red-100">
                  <Text className="text-[10px] font-bold text-red-600">
                    📍 {item.distanceKm} km away ⚠️
                  </Text>
                </View>
              ) : (
                <Text className="text-[10px] text-gray-400">
                  📍 {item.distanceKm.toLocaleString()} km away
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default function DisasterRadar({ alerts }: Props) {
  if (alerts.length === 0) return null;

  const criticalCount = alerts.filter(
    (a) => a.severity === "DANGER" || a.severity === "EXTREME",
  ).length;

  return (
    <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
      {/* Header */}
      <View className="flex-row items-center mb-1">
        <View className="w-7 h-7 rounded-full bg-[#1e90ff] items-center justify-center mr-2">
          <Text className="text-white text-xs">🛰️</Text>
        </View>
        <Text className="text-gray-900 text-base font-bold flex-1">
          Global Disaster Radar
        </Text>
        {criticalCount > 0 && (
          <View className="px-2.5 py-1 rounded-full bg-red-500">
            <Text className="text-xs font-bold text-white">
              {criticalCount} Alert{criticalCount > 1 ? "s" : ""}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-xs text-gray-400 mb-3 ml-9">
        Real-time natural hazards worldwide
      </Text>

      {/* Alerts list */}
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item, index }) => <AlertItem item={item} index={index} />}
        ListEmptyComponent={
          <View className="py-6 items-center">
            <Text className="text-3xl mb-2">🌍</Text>
            <Text className="text-sm text-gray-500 text-center">
              No significant natural disasters reported right now.
            </Text>
          </View>
        }
      />

      {/* Legend */}
      <View className="flex-row justify-center gap-4 mt-2 pt-3 border-t border-gray-100">
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5" />
          <Text className="text-[10px] text-gray-500">Danger</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-1.5" />
          <Text className="text-[10px] text-gray-500">Warning</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-1.5" />
          <Text className="text-[10px] text-gray-500">Watch</Text>
        </View>
      </View>
    </View>
  );
}
