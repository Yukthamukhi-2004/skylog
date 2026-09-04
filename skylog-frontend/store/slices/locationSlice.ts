import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Location {
  id?: string;
  label: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timezone: string;
  elevation_m: number;
  is_home: boolean;
  is_favourite: boolean;
}

interface LocationState {
  activeLocation: Location | null;
  savedLocations: Location[];
  usingGPS: boolean;
}

const initialState: LocationState = {
  activeLocation: null,
  savedLocations: [],
  usingGPS: true,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setActiveLocation: (state, action: PayloadAction<Location>) => {
      state.activeLocation = action.payload;
    },
    setSavedLocations: (state, action: PayloadAction<Location[]>) => {
      state.savedLocations = action.payload;
    },
    addLocation: (state, action: PayloadAction<Location>) => {
      state.savedLocations.push(action.payload);
    },
    removeLocation: (state, action: PayloadAction<string>) => {
      state.savedLocations = state.savedLocations.filter(
        (l) => l.id !== action.payload,
      );
    },
    toggleFavourite: (state, action: PayloadAction<string>) => {
      const loc = state.savedLocations.find((l) => l.id === action.payload);
      if (loc) loc.is_favourite = !loc.is_favourite;
    },
    setUsingGPS: (state, action: PayloadAction<boolean>) => {
      state.usingGPS = action.payload;
    },
    clearLocations: (state) => {
      state.activeLocation = null;
      state.savedLocations = [];
    },
  },
});

export const {
  setActiveLocation,
  setSavedLocations,
  addLocation,
  removeLocation,
  toggleFavourite,
  setUsingGPS,
  clearLocations,
} = locationSlice.actions;

export default locationSlice.reducer;
