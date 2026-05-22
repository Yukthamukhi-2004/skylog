import { useAuth } from "@clerk/expo";
import { router } from "expo-router";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/signIn");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      Alert.alert("Sign-out failed", msg);
      console.error("Error signing out:", error);
    }
  };
  return (
    <View>
      <Text>Profile</Text>
      <TouchableOpacity onPress={handleSignOut}>
        <Text>SignOut</Text>
      </TouchableOpacity>
    </View>
  );
}
