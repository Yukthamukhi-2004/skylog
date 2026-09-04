import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  // isLoaded checks if ClerkProvider has fully finished mounting context
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace("/(root)/(tabs)"); // Redirect to your home/dashboard tabs group
    } else {
      router.replace("/signIn"); // Redirect to your auth screen group
    }
  }, [isSignedIn, isLoaded]);

  // Keep rendering a minor placeholder guard so hooks inside don't execute prematurely
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
