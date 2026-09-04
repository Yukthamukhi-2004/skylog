import { useEffect, useState } from "react";
import { fetchAirQuality, getAQICategory } from "../Services/airQualityApi";
import { fetchWeather } from "../Services/weatherApi";

// Define the shape of data your Maps component uses
export interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  apparentTemp: number;
  aqi: string;
  aqiColor: string;
}

const getWeatherCondition = (
  code: number,
  temperature: number,
  apparentTemp: number,
  windSpeed: number,
): string => {
  if (windSpeed >= 40) return "Windy 🌬️";
  if (code === 0) {
    if (temperature >= 38 || apparentTemp >= 40) return "extreme Heat 🥵"; // extreme heat
    if (temperature >= 30) return "Hot & Sunny 🌞"; // warm sunny
    return "Sunny ☀️";
  }
  if (code >= 1 && code <= 2) return "Partly Cloudy 🌤️";
  if (code === 3) return "Cloudy ☁️";
  if (code >= 45 && code <= 48) {
    if (temperature >= 28) return "Hazy & Humid 🌫️"; // hot fog = haze
    return "Foggy 😶‍🌫️";
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
    return "Rainy 🌧️";
  if (code >= 71 && code <= 77) return "Snowy ❄️";
  if (code >= 95 && code <= 99) return "Thunderstorm ⛈️";

  return "Clear";
};

export function useWeatherData(
  coords: { latitude: number; longitude: number } | null,
) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = async () => {
    if (!coords) return;

    setLoading(true);
    setError(null);

    try {
      const cleanLat = Number(coords?.latitude.toFixed(4));
      const cleanLon = Number(coords?.longitude.toFixed(4));

      const [weatherRes, airRes] = await Promise.allSettled([
        fetchWeather(cleanLat, cleanLon),
        fetchAirQuality(cleanLat, cleanLon),
      ]);

      const weatherData =
        weatherRes.status === "fulfilled" ? weatherRes.value : null;
      const airQualityData =
        airRes.status === "fulfilled" ? airRes.value : null;

      if (!weatherData) {
        throw new Error(
          weatherRes.status === "rejected"
            ? weatherRes.reason?.message || "Failed to fetch weather"
            : "Failed to fetch weather",
        );
      }

      const rawAqi = airQualityData?.current?.us_aqi ?? 0;
      const aqiDetails = getAQICategory(rawAqi);

      const temperature = Math.round(weatherData.current.temperature_2m);
      const apparentTemp = Math.round(
        weatherData.current.apparent_temperature ?? temperature,
      );
      const windSpeed = weatherData.current.wind_speed_10m ?? 0;

      const mappedWeather: WeatherData = {
        condition: getWeatherCondition(
          weatherData.current.weather_code,
          weatherData.current.temperature_2m,
          weatherData.current.wind_speed_10m,
          weatherData.current.is_day,
        ),
        temperature,
        apparentTemp,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed,
        aqi: `${rawAqi} - ${aqiDetails.label}`,
        aqiColor: aqiDetails.color,
      };

      setWeather(mappedWeather);
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      setError(err.message || "Failed to fetch weather data");
      console.error("Error fetching weather:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [coords]);

  return {
    weather,
    loading,
    error,
    retryCount,
    onRetry: handleRetry,
    weatherError: error,
  };
}
