import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface HealthProfile {
  age: number;
  gender: string;
  conditions: string[];
  medications: string[];
  activity_level: number;
  respiratory_issues: boolean;
  heart_conditions: boolean;
  skin_sensitivity: boolean;
  personal_risk_score: number;
}

export interface UserProfile {
  id: string;
  clerk_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string;
  timezone: string;
}

export interface ClimateHealthProfile {
  age: string;
  address: string;
  city: string;
  state: string;
  country: string;
  healthConcerns: string[];
  allergies: string[];
  skinIssues: string[];
}

interface ProfileState {
  profile: UserProfile | null;
  healthProfile: HealthProfile | null;
  climateHealth: ClimateHealthProfile;
  isProfileLoaded: boolean;
}

const initialClimateHealth: ClimateHealthProfile = {
  age: "",
  address: "",
  city: "",
  state: "",
  country: "",
  healthConcerns: [],
  allergies: [],
  skinIssues: [],
};

const initialState: ProfileState = {
  profile: null,
  healthProfile: null,
  climateHealth: initialClimateHealth,
  isProfileLoaded: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.isProfileLoaded = true;
    },
    setHealthProfile: (state, action: PayloadAction<HealthProfile>) => {
      state.healthProfile = action.payload;
    },
    updateRiskScore: (state, action: PayloadAction<number>) => {
      if (state.healthProfile) {
        state.healthProfile.personal_risk_score = action.payload;
      }
    },
    updateHealthField: (
      state,
      action: PayloadAction<{ field: keyof HealthProfile; value: any }>,
    ) => {
      if (state.healthProfile) {
        (state.healthProfile as any)[action.payload.field] =
          action.payload.value;
      }
    },
    updateClimateField: (
      state,
      action: PayloadAction<{ field: keyof ClimateHealthProfile; value: any }>,
    ) => {
      (state.climateHealth as any)[action.payload.field] = action.payload.value;
    },
    updateClimateMultiField: (
      state,
      action: PayloadAction<{ field: keyof ClimateHealthProfile; value: string }>,
    ) => {
      const { field, value } = action.payload;
      const arr = state.climateHealth[field];
      if (Array.isArray(arr)) {
        const idx = arr.indexOf(value);
        if (idx >= 0) {
          arr.splice(idx, 1);
        } else {
          arr.push(value);
        }
      }
    },
    setClimateHealth: (state, action: PayloadAction<ClimateHealthProfile>) => {
      state.climateHealth = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.healthProfile = null;
      state.climateHealth = initialClimateHealth;
      state.isProfileLoaded = false;
    },
  },
});

export const {
  setProfile,
  setHealthProfile,
  updateRiskScore,
  updateHealthField,
  updateClimateField,
  updateClimateMultiField,
  setClimateHealth,
  clearProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
