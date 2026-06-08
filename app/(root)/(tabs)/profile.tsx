import { useAuth } from "@clerk/expo";
import { router } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView>
      <Text style={styles.Title}>Profile</Text>
      <View style={styles.card}>
        <Text>Name:</Text>
        <Text>Email:</Text>
        <Text>Age:</Text>
      </View>
      <TouchableOpacity onPress={handleSignOut}>
        <Text>SignOut</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  Title: {
    fontSize: 35,
    color: "#4A90E2",
    textAlignVertical: "center",
    fontWeight: "bold",
  },
  card: {
    position: "relative",
    top: 10,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginLeft: 20,
    marginRight: 20,
    padding: 15,
  },
});
