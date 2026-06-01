import { useCallback, useRef, useState } from "react";

export type LocationSuggestion = {
  id: string;
  name: string;
  displayName: string;
  country: string;
  state?: string;
  latitude: number;
  longitude: number;
};

// Uses the open-source Nominatim API (no key required)
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

export function useLocationSearch() {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(
          query,
        )}&format=json&addressdetails=1&limit=8&featuretype=city,state,country`;

        const res = await fetch(url, {
          headers: { "Accept-Language": "en" },
        });

        if (!res.ok) throw new Error("Search failed");

        const data = await res.json();

        const mapped: LocationSuggestion[] = data.map((item: any) => {
          const addr = item.address || {};
          const city =
            addr.city ||
            addr.town ||
            addr.village ||
            addr.municipality ||
            addr.county ||
            "";
          const state = addr.state || addr.region || "";
          const country = addr.country || "";

          const nameParts = [city, state, country].filter(Boolean);
          const uniqueParts = [...new Set(nameParts)];

          return {
            id: item.place_id?.toString() || `${item.lat}_${item.lon}`,
            name: city || state || item.display_name.split(",")[0],
            displayName: uniqueParts.join(", "),
            country,
            state,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
          };
        });

        // Deduplicate by display name
        const seen = new Set<string>();
        const deduped = mapped.filter((s) => {
          if (seen.has(s.displayName)) return false;
          seen.add(s.displayName);
          return true;
        });

        setSuggestions(deduped);
      } catch (e) {
        setError("Could not fetch suggestions. Check your connection.");
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, []);

  const clear = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return { suggestions, loading, error, search, clear };
}
