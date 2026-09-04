import React from "react";
import { Text, View } from "react-native";
import { DayData } from "../../hooks/useHomeScreenData";
import { formatDate, getWeatherEmoji, getWeatherLabel } from "./weatherUtils";

interface Props {
  day: DayData;
  accentColor?: string;
}

export default function DayCard({ day, accentColor = "#1e90ff" }: Props) {
  const wi = getWeatherEmoji(day.weatherCode);
  const label = getWeatherLabel(day.weatherCode);

  return (
    <View
      className={`rounded-2xl p-4 border flex-1 ${
        day.label === "Today"
          ? "bg-[#1e90ff]/10 border-[#1e90ff]/30"
          : "bg-white border-gray-200"
      }`}
    >
      {/* Day label */}
      <View className="flex-row items-center mb-2">
        <Text
          className={`text-sm font-bold ${
            day.label === "Today" ? "text-[#1e90ff]" : "text-gray-900"
          }`}
        >
          {day.label}
        </Text>
        {day.label === "Today" && (
          <View className="ml-2 px-2 py-0.5 rounded-full bg-[#1e90ff]/20">
            <Text className="text-[10px] font-bold text-[#1e90ff]">NOW</Text>
          </View>
        )}
      </View>

      <Text className="text-xs text-gray-400 mb-2">{formatDate(day.date)}</Text>

      {/* Weather icon + label */}
      <View className="items-center mb-3">
        <Text className="text-3xl mb-1">{wi}</Text>
        <Text className="text-xs text-gray-500 text-center">{label}</Text>
      </View>

      {/* Temperature */}
      <View className="flex-row items-center justify-center mb-3">
        <Text className="text-xl font-bold text-gray-900">
          {Math.round(day.tempMax)}°
        </Text>
        <Text className="text-sm text-gray-400 ml-1">
          / {Math.round(day.tempMin)}°
        </Text>
      </View>

      {/* Divider */}
      <View className="h-px bg-gray-100 mb-3" />

      {/* Details grid */}
      <View className="flex-row flex-wrap gap-y-2">
        {day.precipitationSum > 0 && (
          <View className="w-1/2 flex-row items-center">
            <Text className="text-xs mr-1">🌧️</Text>
            <Text className="text-xs text-gray-600">{day.precipitationSum}mm</Text>
          </View>
        )}
        {day.uvIndexMax > 0 && (
          <View className="w-1/2 flex-row items-center">
            <Text className="text-xs mr-1">☀️</Text>
            <Text className="text-xs text-gray-600">UV {day.uvIndexMax}</Text>
          </View>
        )}
        {day.sunrise && (
          <View className="w-1/2 flex-row items-center">
            <Text className="text-xs mr-1">🌅</Text>
            <Text className="text-xs text-gray-600">
              {day.sunrise.split("T")[1]?.slice(0, 5) ?? ""}
            </Text>
          </View>
        )}
        {day.sunset && (
          <View className="w-1/2 flex-row items-center">
            <Text className="text-xs mr-1">🌇</Text>
            <Text className="text-xs text-gray-600">
              {day.sunset.split("T")[1]?.slice(0, 5) ?? ""}
            </Text>
          </View>
        )}
        {day.isPast && day.tempMean != null && (
          <View className="w-1/2 flex-row items-center">
            <Text className="text-xs mr-1">📊</Text>
            <Text className="text-xs text-gray-600">Avg {Math.round(day.tempMean)}°</Text>
          </View>
        )}
      </View>
    </View>
  );
}
