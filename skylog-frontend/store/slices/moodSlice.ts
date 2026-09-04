import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface MoodEntry {
  id?: string;
  log_date: string;
  mood_score: number;
  mood_label: string;
  notes?: string;
  temp_at_log?: number;
  aqi_at_log?: number;
  weather_condition?: string;
}

interface MoodState {
  entries: MoodEntry[];
  todaysMood: MoodEntry | null;
}

const initialState: MoodState = {
  entries: [],
  todaysMood: null,
};

const moodSlice = createSlice({
  name: "mood",
  initialState,
  reducers: {
    setTodaysMood: (state, action: PayloadAction<MoodEntry>) => {
      state.todaysMood = action.payload;
    },
    addOrUpdateEntry: (state, action: PayloadAction<MoodEntry>) => {
      const index = state.entries.findIndex(
        (e) => e.log_date === action.payload.log_date,
      );
      if (index >= 0) {
        // update existing entry for that date
        state.entries[index] = action.payload;
      } else {
        state.entries.push(action.payload);
      }
      state.todaysMood = action.payload;
    },
    loadEntries: (state, action: PayloadAction<MoodEntry[]>) => {
      state.entries = action.payload;
      const today = new Date().toISOString().split("T")[0];
      state.todaysMood =
        action.payload.find((e) => e.log_date === today) ?? null;
    },
    clearMoodLogs: (state) => {
      state.entries = [];
      state.todaysMood = null;
    },
  },
});

export const { setTodaysMood, addOrUpdateEntry, loadEntries, clearMoodLogs } =
  moodSlice.actions;

export default moodSlice.reducer;
