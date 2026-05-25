import { API } from "../constants";

export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  timezone: string;
  elevation: number;
  admin1?: string; // state/province
}

export async function searchLocations(
  query: string,
  count = 8,
): Promise<GeoLocation[]> {
  if (!query.trim()) return [];
  const params = new URLSearchParams({
    name: query,
    count: count.toString(),
    language: "en",
    format: "json",
  });
  const GEO_FETCH_TIMEOUT_MS = 5000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEO_FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API.GEOCODING}?${params}`, {
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as any)?.name === "AbortError") {
      throw new Error("Geocoding fetch timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) throw new Error("Geocoding fetch failed");
  const data = await res.json();
  return data.results ?? [];
}

export function formatLocationLabel(loc: GeoLocation): string {
  const parts = [loc.name];
  if (loc.admin1) parts.push(loc.admin1);
  if (loc.country) parts.push(loc.country);
  return parts.join(", ");
}
