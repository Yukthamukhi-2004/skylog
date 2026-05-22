import { API } from "../constants/apiUrls";
import { THRESHOLDS as T } from "../constants/thresholds";

export interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  time: number; // unix ms
  lat: number;
  lon: number;
  depth_km: number;
  url: string;
}

export async function fetchEarthquakes(): Promise<Earthquake[]> {
  const res = await fetch(API.EARTHQUAKE);
  if (!res.ok) throw new Error("Earthquake fetch failed");
  const data = await res.json();
  return (data.features ?? []).map((f: any) => ({
    id: f.id,
    magnitude: f.properties.mag,
    place: f.properties.place,
    time: f.properties.time,
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
    depth_km: f.geometry.coordinates[2],
    url: f.properties.url,
  }));
}

// Haversine distance between two coords in km
export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(0);
}

export function getNearbyEarthquakes(
  earthquakes: Earthquake[],
  userLat: number,
  userLon: number,
) {
  return earthquakes
    .map((eq) => ({
      ...eq,
      distance_km: distanceKm(userLat, userLon, eq.lat, eq.lon),
    }))
    .filter((eq) => eq.distance_km <= T.earthquake.radius_km)
    .sort((a, b) => b.magnitude - a.magnitude);
}

export function getEarthquakeSeverity(magnitude: number) {
  const { magnitude_danger, magnitude_warning, magnitude_watch } = T.earthquake;
  if (magnitude >= magnitude_danger)
    return { level: "DANGER", color: "#ef4444" };
  if (magnitude >= magnitude_warning)
    return { level: "WARNING", color: "#f97316" };
  if (magnitude >= magnitude_watch) return { level: "WATCH", color: "#eab308" };
  return { level: "INFO", color: "#3b82f6" };
}
