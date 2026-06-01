import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useState } from "react";

export type LocationSuggestion = {
  id: string;
  name: string;
  fullName: string;
  latitude: number;
  longitude: number;
  country: string;
  state?: string;
  savedAt?: number;
};

type SavedLocationsContextType = {
  savedLocations: LocationSuggestion[];
  saveLocation: (loc: LocationSuggestion) => Promise<void> | void;
  removeLocation: (id: string) => Promise<void> | void;
  isLocationSaved: (latitude: number, longitude: number) => boolean;
};

const STORAGE_KEY = "SAVED_LOCATIONS::v1";

const SavedLocationsContext = createContext<SavedLocationsContextType>({
  savedLocations: [],
  saveLocation: () => {},
  removeLocation: () => {},
  isLocationSaved: () => false,
});

export const SavedLocationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [savedLocations, setSavedLocations] = useState<LocationSuggestion[]>(
    [],
  );

  const saveLocationLocal = useCallback((loc: LocationSuggestion) => {
    setSavedLocations((prev) => {
      const exists = prev.some((l) => l.id === loc.id);
      if (exists) return prev;
      return [{ ...loc, savedAt: Date.now() }, ...prev];
    });
  }, []);

  const removeLocationLocal = useCallback((id: string) => {
    setSavedLocations((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const isLocationSaved = useCallback(
    (latitude: number, longitude: number) =>
      savedLocations.some(
        (l) => l.latitude === latitude && l.longitude === longitude,
      ),
    [savedLocations],
  );

  return (
    <SavedLocationsContext.Provider
      value={{
        savedLocations,
        saveLocation: saveLocationLocal,
        removeLocation: removeLocationLocal,
        isLocationSaved,
      }}
    >
      {children}
    </SavedLocationsContext.Provider>
  );
};

export const useSavedLocations = () => useContext(SavedLocationsContext);

// AsyncStorage-backed helpers used across screens
export const getSavedLocations = async (): Promise<LocationSuggestion[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json) as LocationSuggestion[];
    return parsed;
  } catch (e) {
    console.warn("getSavedLocations error", e);
    return [];
  }
};

export const saveLocation = async (loc: LocationSuggestion) => {
  try {
    const list = await getSavedLocations();
    const exists = list.some((l) => l.id === loc.id);
    if (exists) return;
    const next = [{ ...loc, savedAt: Date.now() }, ...list];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn("saveLocation error", e);
  }
};

export const removeLocation = async (id: string) => {
  try {
    const list = await getSavedLocations();
    const next = list.filter((l) => l.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn("removeLocation error", e);
  }
};

export const clearAllLocations = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("clearAllLocations error", e);
  }
};

export default SavedLocationsContext;
