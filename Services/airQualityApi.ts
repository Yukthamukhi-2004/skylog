import { API } from "../constants/apiUrls";

const FETCH_TIMEOUT_MS = 10000;

export async function fetchAirQuality(lat: number, lon: number) {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      "pm10",
      "pm2_5",
      "carbon_monoxide",
      "nitrogen_dioxide",
      "sulphur_dioxide",
      "ozone",
      "aerosol_optical_depth",
      "dust",
      "uv_index",
      "european_aqi",
      "us_aqi",
    ].join(","),
    hourly: ["pm2_5", "pm10", "ozone", "nitrogen_dioxide", "us_aqi"].join(","),
    timezone: "auto",
  });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API.AIR_QUALITY}?${params}`, {
      signal: controller.signal,
    });
  } catch (error) {
    const name = (error as any)?.name;
    if (name === "AbortError") {
      throw new Error("Air quality fetch timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) throw new Error("Air quality fetch failed");
  return res.json();
}

export function getAQICategory(aqi: number) {
  if (aqi <= 50) return { label: "Good", color: "#22c55e", risk: "None" };
  if (aqi <= 100)
    return {
      label: "Moderate",
      color: "#eab308",
      risk: "Unusually sensitive people",
    };
  if (aqi <= 150)
    return {
      label: "Unhealthy (sensitive)",
      color: "#f97316",
      risk: "Sensitive groups",
    };
  if (aqi <= 200)
    return { label: "Unhealthy", color: "#ef4444", risk: "Everyone" };
  if (aqi <= 300)
    return {
      label: "Very Unhealthy",
      color: "#a855f7",
      risk: "Health emergency",
    };
  return { label: "Hazardous", color: "#7f1d1d", risk: "Serious harm to all" };
}
