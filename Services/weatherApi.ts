import { API } from "../constants";

const DEFAULT_API_TIMEOUT = 30000;
const RETRY_DELAYS_MS = [0, 500, 1500]; // first attempt immediately, then 2 quick retries

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
      "is_day",
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

  const targetUrl = `${API.FORECAST}?${params.toString()}`;
  let lastError: any;

  // Retry with quick backoff; each attempt has its own timeout.
  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt++) {
    if (RETRY_DELAYS_MS[attempt] > 0) {
      await sleep(RETRY_DELAYS_MS[attempt]);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_API_TIMEOUT);

    try {
      console.log("Requesting Weather from URL:", targetUrl, { attempt });

      const res = await fetch(targetUrl, {
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`Weather fetch failed with status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      lastError = error;
      if ((error as any)?.name === "AbortError") {
        console.warn("Weather fetch timed out", {
          attempt,
          lat,
          lon,
          targetUrl,
        });
      }
      // continue retries
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if ((lastError as any)?.name === "AbortError") {
    throw new Error("Weather fetch timed out");
  }
  throw lastError;
}
