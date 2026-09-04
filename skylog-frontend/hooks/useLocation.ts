import * as Location from "expo-location";
import { useEffect, useState } from "react";

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [coords, setCoords] = useState<LocationCoordinates | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDeviceLocation() {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access Location was denied");
          setLoading(false);
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setCoords({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch {
        setErrorMsg("Error fetching location data");
      } finally {
        setLoading(false);
      }
    }
    getDeviceLocation();
  }, []);

  return { coords, errorMsg, loading };
}
