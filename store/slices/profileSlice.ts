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

interface ProfileState {
  profile: UserProfile | null;
  healthProfile: HealthProfile | null;
  isProfileLoaded: boolean;
}

const initialState: ProfileState = {
  profile: null,
  healthProfile: null,
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
    clearProfile: (state) => {
      state.profile = null;
      state.healthProfile = null;
      state.isProfileLoaded = false;
    },
  },
});

export const {
  setProfile,
  setHealthProfile,
  updateRiskScore,
  updateHealthField,
  clearProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
