import { API } from "../constants/apiUrls";

const FETCH_TIMEOUT_MS = 10000;

async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
  timeoutMs = FETCH_TIMEOUT_MS,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...(options || {}), signal: controller.signal });
  } catch (error) {
    if ((error as any)?.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchPastWeather(
  lat: number,
  lon: number,
  startDate: string, // 'YYYY-MM-DD'
  endDate: string,
) {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    start_date: startDate,
    end_date: endDate,
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "temperature_2m_mean",
      "precipitation_sum",
      "wind_speed_10m_max",
      "shortwave_radiation_sum",
      "et0_fao_evapotranspiration",
    ].join(","),
    timezone: "auto",
  });
  const res = await fetchWithTimeout(`${API.ARCHIVE}?${params}`);
  if (!res.ok) throw new Error("Archive fetch failed");
  return res.json();
}

// Fetch last 30 days for weekly summary + mood correlation
export async function fetchWeeklySummary(lat: number, lon: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return fetchPastWeather(lat, lon, fmt(start), fmt(end));
}

// Calculate simple precipitation anomaly for drought SPI proxy
export function calcSPI(precipValues: number[]): number {
  if (!precipValues.length) return 0;
  const mean = precipValues.reduce((a, b) => a + b, 0) / precipValues.length;
  const std = Math.sqrt(
    precipValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      precipValues.length,
  );
  const recent = precipValues.slice(-7).reduce((a, b) => a + b, 0) / 7;
  return std === 0 ? 0 : +((recent - mean) / std).toFixed(2);
}
