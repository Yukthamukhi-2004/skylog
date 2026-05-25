import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AlertPreferences {
  flood_alerts: boolean;
  earthquake_alerts: boolean;
  tsunami_alerts: boolean;
  drought_alerts: boolean;
  aqi_alerts: boolean;
  uv_alerts: boolean;
  severe_weather: boolean;
  morning_briefing: boolean;
  briefing_time: string;
  min_severity_level: number;
}

interface SettingsState {
  darkMode: boolean;
  offlineMode: boolean;
  alertPreferences: AlertPreferences;
  isFirstLaunch: boolean;
}

const defaultAlerts: AlertPreferences = {
  flood_alerts: true,
  earthquake_alerts: true,
  tsunami_alerts: true,
  drought_alerts: true,
  aqi_alerts: true,
  uv_alerts: true,
  severe_weather: true,
  morning_briefing: true,
  briefing_time: "07:00",
  min_severity_level: 2,
};

const initialState: SettingsState = {
  darkMode: false,
  offlineMode: false,
  alertPreferences: defaultAlerts,
  isFirstLaunch: true,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    toggleOfflineMode: (state) => {
      state.offlineMode = !state.offlineMode;
    },
    setAlertPreferences: (state, action: PayloadAction<AlertPreferences>) => {
      state.alertPreferences = action.payload;
    },
    toggleAlert: (state, action: PayloadAction<keyof AlertPreferences>) => {
      const key = action.payload;
      if (typeof state.alertPreferences[key] === "boolean") {
        (state.alertPreferences as any)[key] = !state.alertPreferences[key];
      }
    },
    setBriefingTime: (state, action: PayloadAction<string>) => {
      state.alertPreferences.briefing_time = action.payload;
    },
    setMinSeverityLevel: (state, action: PayloadAction<number>) => {
      state.alertPreferences.min_severity_level = action.payload;
    },
    setFirstLaunch: (state, action: PayloadAction<boolean>) => {
      state.isFirstLaunch = action.payload;
    },
  },
});

export const {
  toggleDarkMode,
  toggleOfflineMode,
  setAlertPreferences,
  toggleAlert,
  setBriefingTime,
  setMinSeverityLevel,
  setFirstLaunch,
} = settingsSlice.actions;

export default settingsSlice.reducer;
