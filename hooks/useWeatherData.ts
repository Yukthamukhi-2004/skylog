import { useEffect, useState } from "react";
import { fetchAirQuality, getAQICategory } from "../Services/airQualityApi";
import { fetchWeather } from "../Services/weatherApi";

// Define the shape of data your Maps component uses
export interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  aqi: string;
  aqiColor: string;
}

const getWeatherCondition = (code: number): string => {
  if (code === 0) return "Clear 😇";
  if (code >= 1 && code <= 3) return "Clouds ⛅";
  if (code >= 45 && code <= 48) return "Fog 😶‍🌫️";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
    return "Rain 🌧️";
  if (code >= 71 && code <= 77) return "Snow ❄️";
  if (code >= 95 && code <= 99) return "Thunderstorm ⛈️";
  return "Clear";
};

export function useWeatherData(
  coords: { latitude: number; longitude: number } | null,
) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coords) return;

    let isMounted = true;

    async function getAllData() {
      setLoading(true);
      setError(null);
      try {
        const cleanLat = Number(coords?.latitude.toFixed(4));
        const cleanLon = Number(coords?.longitude.toFixed(4));

        const [weatherData, airQualityData] = await Promise.all([
          fetchWeather(cleanLat, cleanLon),
          fetchAirQuality(cleanLat, cleanLon),
        ]);

        if (isMounted) {
          const rawAqi = airQualityData?.current?.us_aqi ?? 0;
          const aqiDetails = getAQICategory(rawAqi);

          const mappedWeather: WeatherData = {
            condition: getWeatherCondition(weatherData.current.weather_code),
            temperature: Math.round(weatherData.current.temperature_2m),
            humidity: weatherData.current.relative_humidity_2m,
            windSpeed: weatherData.current.wind_speed_10m,
            aqi: `${rawAqi} - ${aqiDetails.label}`,
            aqiColor: aqiDetails.color,
          };

          setWeather(mappedWeather);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch weather data");
          console.error("Error fetching weather:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    getAllData();

    // Clean up to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [coords?.latitude, coords?.longitude]); // Deep check coordinate changes

  return { weather, loading, error };
}
