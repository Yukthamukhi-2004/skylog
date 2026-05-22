import { API } from "../constants/apiUrls";

const DEFAULT_API_TIMEOUT = 10000;

export async function fetchElevation(
  lat: number,
  lon: number,
): Promise<number> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
  });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_API_TIMEOUT);

  let res: Response;
  try {
    res = await fetch(`${API.ELEVATION}?${params}`, {
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as any)?.name === "AbortError") {
      throw new Error("Elevation fetch timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok)
    throw new Error(`Elevation fetch failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  // Returns array; grab first value
  return data?.elevation?.[0] ?? 0;
}

// Classify flood/tsunami risk based on elevation
export function getElevationRisk(elevationM: number): {
  label: string;
  riskLevel: "high" | "moderate" | "low";
} {
  if (elevationM < 5)
    return { label: "Coastal low-lying (<5m)", riskLevel: "high" };
  if (elevationM < 20)
    return { label: "Low elevation (5–20m)", riskLevel: "moderate" };
  if (elevationM < 50)
    return { label: "Moderate (20–50m)", riskLevel: "moderate" };
  return { label: "Safe elevation (>50m)", riskLevel: "low" };
}
