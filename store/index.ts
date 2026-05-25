import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";

import locationReducer from "./slices/locationSlice";
import moodReducer from "./slices/moodSlice";
import profileReducer from "./slices/profileSlice";
import settingsReducer from "./slices/settingsSlice";

const persistConfig = {
  key: "skylog-root",
  storage: AsyncStorage,
  whitelist: ["location", "profile", "settings", "mood"], // all slices persisted
};

const rootReducer = combineReducers({
  location: locationReducer,
  profile: profileReducer,
  settings: settingsReducer,
  mood: moodReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

// Types used across the whole app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
