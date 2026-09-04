import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { HourlyData } from "../../hooks/useHomeScreenData";
import { formatHour, getWeatherEmoji } from "./weatherUtils";

interface Props {
  data: HourlyData[];
}

export default function HourlyTimeline({ data }: Props) {
  if (data.length === 0) return null;

  const temps = data.map((h) => h.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const range = maxTemp - minTemp || 1;

  return (
    <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
      <View className="flex-row items-center mb-3">
        <View className="w-7 h-7 rounded-full bg-[#1e90ff] items-center justify-center mr-2">
          <Text className="text-white text-xs">🕐</Text>
        </View>
        <Text className="text-gray-900 text-base font-bold">Hourly Forecast</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4, gap: 0 }}
      >
        {data.map((hour, idx) => {
          const isNow = idx === 0;
          const tempPercent = ((hour.temperature - minTemp) / range) * 100;

          return (
            <TouchableOpacity
              key={hour.time}
              activeOpacity={0.6}
              className={`items-center px-3 py-2 rounded-xl ${isNow ? "bg-[#1e90ff]/10" : ""}`}
              style={{ minWidth: 60 }}
            >
              <Text
                className={`text-xs font-medium mb-1 ${
                  isNow ? "text-[#1e90ff]" : "text-gray-500"
                }`}
              >
                {isNow ? "Now" : formatHour(hour.time)}
              </Text>

              <Text className="text-lg mb-1">
                {getWeatherEmoji(hour.weatherCode)}
              </Text>

              <Text className="text-sm font-bold text-gray-800">
                {hour.temperature}°
              </Text>

              {/* Temperature bar */}
              <View className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                <View
                  className="h-full rounded-full bg-[#1e90ff]"
                  style={{ width: `${Math.max(tempPercent, 10)}%` }}
                />
              </View>

              {/* Precip prob */}
              {hour.precipitationProb > 0 && (
                <View className="flex-row items-center mt-1.5">
                  <Text className="text-[10px] text-[#1e90ff] font-medium">
                    💧{hour.precipitationProb}%
                  </Text>
                </View>
              )}

              {/* Wind */}
              <Text className="text-[10px] text-gray-400 mt-0.5">
                💨 {hour.windSpeed}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
