import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ErrorCard from "../../../components/ErrorCard";
import { PageLoadingSkeleton } from "../../../components/SkeletonLoaders";
import DayCard from "../../../components/home/DayCard";
import DisasterRadar from "../../../components/home/DisasterRadar";
import HealthScore from "../../../components/home/HealthScore";
import HourlyTimeline from "../../../components/home/HourlyTimeline";
import LocalRiskBadge from "../../../components/home/LocalRiskBadge";
import WeatherBrief from "../../../components/home/WeatherBrief";
import { getWeatherEmoji } from "../../../components/home/weatherUtils";
import { useHomeScreenData } from "../../../hooks/useHomeScreenData";
import { useLocation } from "../../../hooks/useLocation";

export default function HomeScreen() {
  const { coords, errorMsg, loading: locLoading } = useLocation();
  const {
    loading,
    error,
    hourly,
    days,
    currentTemp,
    currentApparentTemp,
    currentHumidity,
    currentWind,
    currentWeatherCode,
    currentIsDay,
    aqi,
    disasterAlerts,
    elevation,
    elevationRisk,
    floodRisk,
    droughtRisk,
    tsunamiRisk,
    healthInsights,
    brief,
    triggerRefetch,
  } = useHomeScreenData(coords);

  const isLoading = locLoading || loading;

  if (locLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator size="large" color="#1e90ff" />
          <Text className="text-gray-500 text-sm mt-4">
            Getting your location...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg && !coords) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-4">📍</Text>
          <Text className="text-gray-800 text-lg font-bold text-center mb-2">
            Location Unavailable
          </Text>
          <Text className="text-gray-500 text-sm text-center">{errorMsg}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={triggerRefetch}
            tintColor="#1e90ff"
          />
        }
      >
        {/* ─── Header ─── */}
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center">
            <Text className="text-3xl font-bold text-[#1e90ff] tracking-tight">
              SkyLog
            </Text>
          </View>
          <Text className="text-gray-500 text-sm mt-0.5">
            Your personalized shield against the elements
          </Text>
        </View>

        {/* ─── Loading state ─── */}
        {isLoading && !days.length && <PageLoadingSkeleton />}

        {/* ─── Error state ─── */}
        {error && (
          <View className="px-4">
            <ErrorCard error={error} onRetry={triggerRefetch} type="error" />
          </View>
        )}

        {/* ─── Current Conditions Hero ─── */}
        {!isLoading && currentTemp > 0 && (
          <View className="mx-4 mb-4 bg-white rounded-2xl p-5 border border-gray-200">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-5xl font-bold text-gray-900">
                  {currentTemp}°C
                </Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-lg mr-2">
                    {getWeatherEmoji(currentWeatherCode, currentIsDay === 1)}
                  </Text>
                  <Text className="text-gray-600 text-base">
                    Feels like {Math.round(currentApparentTemp)}°
                  </Text>
                </View>
              </View>

              {/* AQI circle */}
              <View className="items-center">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: aqi.color + "20" }}
                >
                  <Text
                    className="text-xl font-bold"
                    style={{ color: aqi.color }}
                  >
                    {aqi.value}
                  </Text>
                </View>
                <Text className="text-[10px] text-gray-500 mt-1 font-medium">
                  AQI
                </Text>
              </View>
            </View>

            {/* Detail row */}
            <View className="flex-row mt-5 pt-4 border-t border-gray-100 gap-4">
              <View className="flex-1 items-center">
                <Text className="text-lg mb-1">💧</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {currentHumidity}%
                </Text>
                <Text className="text-[10px] text-gray-400">Humidity</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-lg mb-1">💨</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {currentWind} km/h
                </Text>
                <Text className="text-[10px] text-gray-400">Wind</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-lg mb-1">🌡️</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {aqi.label}
                </Text>
                <Text className="text-[10px] text-gray-400">Air Quality</Text>
              </View>
            </View>
          </View>
        )}

        {/* ─── Smart Brief ─── */}
        <View className="px-4">
          <WeatherBrief brief={brief} loading={isLoading} />
        </View>

        {/* ─── Yesterday / Today / Tomorrow Cards ─── */}
        {days.length > 0 && (
          <View className="px-4 mb-4">
            <View className="flex-row items-center mb-3">
              <View className="w-7 h-7 rounded-full bg-[#1e90ff] items-center justify-center mr-2">
                <Text className="text-white text-xs">📅</Text>
              </View>
              <Text className="text-gray-900 text-base font-bold">
                4-Day Outlook
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
            >
              {days.map((day) => (
                <View key={day.date} style={{ minWidth: 150, maxWidth: 170 }}>
                  <DayCard day={day} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ─── Hourly Timeline ─── */}
        <View className="px-4">
          <HourlyTimeline data={hourly} />
        </View>

        {/* ─── Health Score ─── */}
        <View className="px-4">
          <HealthScore insights={healthInsights} />
        </View>

        {/* ─── Local Risk Assessment ─── */}
        <View className="px-4">
          <LocalRiskBadge
            elevation={elevation}
            elevationRisk={elevationRisk}
            floodRisk={floodRisk}
            droughtRisk={droughtRisk}
            tsunamiRisk={tsunamiRisk}
          />
        </View>

        {/* ─── Global Disaster Radar ─── */}
        <View className="px-4">
          <DisasterRadar alerts={disasterAlerts} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
