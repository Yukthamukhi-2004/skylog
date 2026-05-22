import { API } from "../constants/apiUrls";
import { calcFloodSeverity } from "./disasterLogic";

const DEFAULT_API_TIMEOUT = 10000;

export async function fetchFloodData(lat: number, lon: number) {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    daily: [
      "river_discharge",
      "river_discharge_mean",
      "river_discharge_median",
      "river_discharge_max",
      "river_discharge_min",
    ].join(","),
    forecast_days: "7",
  });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_API_TIMEOUT);

  let res: Response;
  try {
    res = await fetch(`${API.FLOOD}?${params}`, { signal: controller.signal });
  } catch (error) {
    if ((error as any)?.name === "AbortError") {
      throw new Error("Flood data fetch timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) throw new Error("Flood data fetch failed");
  const data = await res.json();
  return data;
}

export async function fetchFloodWithSeverity(
  lat: number,
  lon: number,
  elevation: number,
) {
  const data = await fetchFloodData(lat, lon);
  const discharge = data?.daily?.river_discharge?.[0] ?? 0;
  const severity = calcFloodSeverity(discharge, elevation);
  return { raw: data, severity };
}
