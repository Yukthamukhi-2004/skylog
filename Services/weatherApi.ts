import { API } from "../constants";

const DEFAULT_API_TIMEOUT = 10000;

export async function fetchWeather(lat: number, lon: number) {
  if (lat === undefined || lon === undefined) {
    throw new Error("Missing coordinates");
  }

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "surface_pressure",
      "uv_index",
      "precipitation",
    ].join(","),
    hourly: [
      "temperature_2m",
      "precipitation_probability",
      "wind_speed_10m",
      "uv_index",
    ].join(","),
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "weather_code",
      "precipitation_sum",
      "uv_index_max",
      "sunrise",
      "sunset",
    ].join(","),
    timezone: "auto",
    forecast_days: "7",
  });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_API_TIMEOUT);

  try {
    const targetUrl = `${API.FORECAST}?${params.toString()}`;
    console.log("Requesting Weather from URL:", targetUrl);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Weather fetch failed with status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    if ((error as any)?.name === "AbortError") {
      throw new Error("Weather fetch timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
