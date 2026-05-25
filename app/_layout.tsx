import { ClerkLoaded, ClerkProvider } from "@clerk/expo";
import { Slot } from "expo-router";
import * as SecureStore from "expo-secure-store";
import "../global.css";

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      return item;
    } catch (error) {
      console.error("Failed to read token from secure store:", error);
      // Only delete if the token is corrupted, not on transient errors
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

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <Slot />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
