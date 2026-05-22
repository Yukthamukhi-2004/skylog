import { API } from "../constants/apiUrls";
import { calcTsunamiRisk } from "./disasterLogic";

const DEFAULT_API_TIMEOUT = 10000;

export async function fetchMarineData(lat: number, lon: number) {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      "wave_height",
      "wave_direction",
      "wave_period",
      "wind_wave_height",
      "wind_wave_period",
      "swell_wave_height",
      "swell_wave_period",
      "swell_wave_direction",
      "ocean_current_velocity",
      "ocean_current_direction",
    ].join(","),
    hourly: ["wave_height", "wave_period", "swell_wave_height"].join(","),
    daily: ["wave_height_max", "wave_period_max"].join(","),
    timezone: "auto",
    forecast_days: "3",
  });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_API_TIMEOUT);

  let res: Response;
  try {
    res = await fetch(`${API.MARINE}?${params}`, { signal: controller.signal });
  } catch (error) {
    if ((error as any)?.name === "AbortError") {
      throw new Error("Marine data fetch timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) throw new Error("Marine data fetch failed");
  return res.json();
}

export async function fetchMarineWithTsunamiRisk(
  lat: number,
  lon: number,
  elevation: number,
) {
  const data = await fetchMarineData(lat, lon);
  const waveHeight = data?.current?.wave_height ?? 0;
  const wavePeriod = data?.current?.wave_period ?? 0; // seconds
  const tsunami = calcTsunamiRisk(waveHeight, wavePeriod, elevation);
  return { raw: data, tsunami };
}

export function getSeaState(waveHeight: number): string {
  if (waveHeight < 0.1) return "Glassy";
  if (waveHeight < 0.5) return "Rippled";
  if (waveHeight < 1.25) return "Slight";
  if (waveHeight < 2.5) return "Moderate";
  if (waveHeight < 4.0) return "Rough";
  if (waveHeight < 6.0) return "Very Rough";
  if (waveHeight < 9.0) return "High";
  return "Phenomenal";
}
