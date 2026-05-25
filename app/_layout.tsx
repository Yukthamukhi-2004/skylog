import { ClerkLoaded, ClerkProvider } from "@clerk/expo";
import { Slot } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator, View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "../global.css";
import { persistor, store } from "../store/index";

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      return item;
    } catch (error) {
      console.error("Failed to read token from secure store:", error);
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (deleteError) {
        console.error("Failed to delete corrupted token:", deleteError);
      }
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("Failed to save token to secure store:", error);
      return;
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

// Shown while Redux is rehydrating persisted state from AsyncStorage
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
          <ClerkLoaded>
            <Slot />
          </ClerkLoaded>
        </ClerkProvider>
      </PersistGate>
    </Provider>
  );
}
