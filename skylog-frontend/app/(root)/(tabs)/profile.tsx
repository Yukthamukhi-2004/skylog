import { useAuth, useUser } from "@clerk/expo";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DropdownPicker from "../../../components/DropdownPicker";
import {
  ALLERGIES,
  HEALTH_CONCERNS,
  SKIN_ISSUES,
} from "../../../components/profile/ClimateHealthData";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  setClimateHealth,
  updateClimateField,
  updateClimateMultiField,
} from "../../../store/slices/profileSlice";

const ACCENT = "#1e90ff";

export default function Profile() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const dispatch = useAppDispatch();

  // Guard against persisted or missing profile slice shapes by falling back
  // to the expected default climate health object. This prevents runtime
  // crashes like "Cannot read property 'age' of undefined" when the
  // persisted state is malformed or still loading.
  const defaultClimateHealth = {
    age: "",
    address: "",
    city: "",
    state: "",
    country: "",
    healthConcerns: [] as string[],
    allergies: [] as string[],
    skinIssues: [] as string[],
  };

  const climateHealth = useAppSelector(
    (s) => s.profile?.climateHealth ?? defaultClimateHealth,
  );

  // Local text input state for smoother typing
  const [age, setAge] = useState(() => climateHealth.age || "");
  const [address, setAddress] = useState(() => climateHealth.address || "");
  const [city, setCity] = useState(() => climateHealth.city || "");
  const [state, setState] = useState(() => climateHealth.state || "");
  const [country, setCountry] = useState(() => climateHealth.country || "");

  // Sync local state back to Redux on unmount / blur
  const syncTextField = useCallback(
    (
      field: "age" | "address" | "city" | "state" | "country",
      value: string,
    ) => {
      dispatch(updateClimateField({ field, value }));
    },
    [dispatch],
  );

  useEffect(() => {
    const data = {
      age,
      address,
      city,
      state,
      country,
      healthConcerns: climateHealth.healthConcerns,
      allergies: climateHealth.allergies,
      skinIssues: climateHealth.skinIssues,
    };
    dispatch(setClimateHealth(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const firstName = user?.firstName ?? "";
  const lastName = user?.lastName ?? "";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-3xl font-bold text-[#1e90ff] tracking-tight">
          Profile
        </Text>
        <Text className="text-gray-500 text-sm mt-1">
          Manage your personal and climate-health information
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Personal Details Card ─── */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 rounded-full bg-[#1e90ff] items-center justify-center mr-3">
              <Text className="text-white text-sm font-bold">👤</Text>
            </View>
            <Text className="text-gray-900 text-lg font-bold">
              Personal Details
            </Text>
          </View>

          {/* Clerk-provided fields (read-only) */}
          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-500 mb-1">Name</Text>
            <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5">
              <Text className="text-gray-800 text-base">
                {firstName || lastName
                  ? [firstName, lastName].filter(Boolean).join(" ")
                  : "Not set"}
              </Text>
            </View>
          </View>

          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-500 mb-1">
              Email
            </Text>
            <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5">
              <Text className="text-gray-800 text-base">
                {email || "Not set"}
              </Text>
            </View>
          </View>

          {/* Editable fields */}
          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-500 mb-1">Age</Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              onBlur={() => syncTextField("age", age)}
              placeholder="Enter your age"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 text-base"
            />
          </View>

          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-500 mb-1">
              Address
            </Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              onBlur={() => syncTextField("address", address)}
              placeholder="Street address"
              placeholderTextColor="#9CA3AF"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 text-base"
            />
          </View>

          <View className="flex-row mb-3 gap-3">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-500 mb-1">
                City
              </Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                onBlur={() => syncTextField("city", city)}
                placeholder="City"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 text-base"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-500 mb-1">
                State
              </Text>
              <TextInput
                value={state}
                onChangeText={setState}
                onBlur={() => syncTextField("state", state)}
                placeholder="State"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 text-base"
              />
            </View>
          </View>

          <View className="mb-1">
            <Text className="text-sm font-medium text-gray-500 mb-1">
              Country
            </Text>
            <TextInput
              value={country}
              onChangeText={setCountry}
              onBlur={() => syncTextField("country", country)}
              placeholder="Country"
              placeholderTextColor="#9CA3AF"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 text-base"
            />
          </View>
        </View>

        {/* ─── Health Concerns Card ─── */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 rounded-full bg-[#1e90ff] items-center justify-center mr-3">
              <Text className="text-white text-sm font-bold">🫁</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-bold">
                Climate & Weather Health Concerns
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5">
                Select all that apply to you
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {HEALTH_CONCERNS.map((concern) => {
              const selected = climateHealth.healthConcerns.includes(concern);
              return (
                <TouchableOpacity
                  key={concern}
                  onPress={() =>
                    dispatch(
                      updateClimateMultiField({
                        field: "healthConcerns",
                        value: concern,
                      }),
                    )
                  }
                  activeOpacity={0.7}
                  className={`rounded-xl px-3.5 py-2.5 border ${
                    selected
                      ? "bg-[#1e90ff]/10 border-[#1e90ff]"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      selected ? "text-[#1e90ff] font-medium" : "text-gray-600"
                    }`}
                  >
                    {selected ? "✓ " : ""}
                    {concern}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─── Allergies Card ─── */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-full bg-[#1e90ff] items-center justify-center mr-3">
              <Text className="text-white text-sm font-bold">🌿</Text>
            </View>
            <Text className="text-gray-900 text-lg font-bold">Allergies</Text>
          </View>
          <Text className="text-gray-400 text-xs mb-3">
            Select all allergies you have
          </Text>

          <DropdownPicker
            label=""
            options={ALLERGIES}
            selected={climateHealth.allergies}
            onToggle={(value) =>
              dispatch(
                updateClimateMultiField({
                  field: "allergies",
                  value,
                }),
              )
            }
            placeholder="Tap to select allergies..."
          />

          {/* Selected allergies pills */}
          {climateHealth.allergies.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-2">
              {climateHealth.allergies.map((a) => (
                <TouchableOpacity
                  key={a}
                  onPress={() =>
                    dispatch(
                      updateClimateMultiField({
                        field: "allergies",
                        value: a,
                      }),
                    )
                  }
                  className="bg-[#1e90ff]/10 rounded-full px-3 py-1.5 flex-row items-center"
                  activeOpacity={0.7}
                >
                  <Text className="text-[#1e90ff] text-sm mr-1.5">{a}</Text>
                  <Text className="text-gray-400 text-xs">✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ─── Skin Issues Card ─── */}
        <View className="bg-white rounded-2xl p-5 mb-6 border border-gray-200">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-full bg-[#1e90ff] items-center justify-center mr-3">
              <Text className="text-white text-sm font-bold">🧴</Text>
            </View>
            <Text className="text-gray-900 text-lg font-bold">Skin Issues</Text>
          </View>
          <Text className="text-gray-400 text-xs mb-3">
            Select climate-related skin issues you experience
          </Text>

          <DropdownPicker
            label=""
            options={SKIN_ISSUES}
            selected={climateHealth.skinIssues}
            onToggle={(value) =>
              dispatch(
                updateClimateMultiField({
                  field: "skinIssues",
                  value,
                }),
              )
            }
            placeholder="Tap to select skin issues..."
          />

          {/* Selected skin issues pills */}
          {climateHealth.skinIssues.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-2">
              {climateHealth.skinIssues.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() =>
                    dispatch(
                      updateClimateMultiField({
                        field: "skinIssues",
                        value: s,
                      }),
                    )
                  }
                  className="bg-[#1e90ff]/10 rounded-full px-3 py-1.5 flex-row items-center"
                  activeOpacity={0.7}
                >
                  <Text className="text-[#1e90ff] text-sm mr-1.5">{s}</Text>
                  <Text className="text-gray-400 text-xs">✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ─── Sign Out ─── */}
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Sign out",
              "Are you sure you want to sign out?",
              [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: handleSignOut },
              ],
              { cancelable: true },
            )
          }
          className="bg-red-50 border border-red-200 rounded-xl py-4 items-center"
          activeOpacity={0.7}
        >
          <Text className="text-red-500 text-base font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
/* {handleSignOut} */
