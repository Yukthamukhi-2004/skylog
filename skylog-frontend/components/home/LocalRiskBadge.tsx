import React from "react";
import { Text, View } from "react-native";

interface RiskItem {
  label: string;
  level: "high" | "moderate" | "low";
  icon: string;
}

interface Props {
  elevation: number | null;
  elevationRisk: { label: string; riskLevel: "high" | "moderate" | "low" } | null;
  floodRisk: { level: string } | null;
  droughtRisk: { level: string } | null;
  tsunamiRisk: { level: string } | null;
}

function RiskBadge({ level }: { level: string }) {
  const colorMap: Record<string, string> = {
    DANGER: "bg-red-500",
    EXTREME: "bg-red-500",
    WARNING: "bg-orange-500",
    SEVERE: "bg-orange-500",
    MODERATE: "bg-yellow-500",
    WATCH: "bg-yellow-500",
    INFO: "bg-blue-500",
    high: "bg-red-500",
    moderate: "bg-yellow-500",
    low: "bg-green-500",
  };
  const bg = colorMap[level] ?? "bg-gray-400";
  return (
    <View className={`px-2 py-0.5 rounded-full ${bg}`}>
      <Text className="text-[10px] font-bold text-white uppercase">{level}</Text>
    </View>
  );
}

export default function LocalRiskBadge({
  elevation,
  elevationRisk,
  floodRisk,
  droughtRisk,
  tsunamiRisk,
}: Props) {
  const items: RiskItem[] = [];

  if (elevationRisk) {
    items.push({
      label: `Elevation: ${elevation}m — ${elevationRisk.label}`,
      level: elevationRisk.riskLevel,
      icon: "⛰️",
    });
  }

  if (floodRisk && floodRisk.level !== "WATCH") {
    items.push({
      label: "Flood Risk",
      level: floodRisk.level === "DANGER" ? "high" as const : "moderate" as const,
      icon: "🌊",
    });
  }

  if (droughtRisk) {
    items.push({
      label: `Drought: ${droughtRisk.level}`,
      level: droughtRisk.level === "EXTREME" ? "high" as const : droughtRisk.level === "SEVERE" ? "moderate" as const : "low" as const,
      icon: "🏜️",
    });
  }

  if (tsunamiRisk) {
    items.push({
      label: "Tsunami Risk",
      level: "high" as const,
      icon: "🌊",
    });
  }

  if (items.length === 0) {
    items.push({
      label: "No significant local hazards detected",
      level: "low" as const,
      icon: "✅",
    });
  }

  return (
    <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
      <View className="flex-row items-center mb-3">
        <View className="w-7 h-7 rounded-full bg-[#1e90ff] items-center justify-center mr-2">
          <Text className="text-white text-xs">🛡️</Text>
        </View>
        <Text className="text-gray-900 text-base font-bold">
          Local Risk Assessment
        </Text>
      </View>

      {items.map((item, idx) => (
        <View
          key={idx}
          className={`flex-row items-center py-2.5 ${idx < items.length - 1 ? "border-b border-gray-100" : ""}`}
        >
          <Text className="text-base mr-3">{item.icon}</Text>
          <Text className="flex-1 text-sm text-gray-700">{item.label}</Text>
          <RiskBadge level={item.level} />
        </View>
      ))}
    </View>
  );
}
