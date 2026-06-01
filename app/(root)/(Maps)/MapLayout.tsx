import { Stack } from "expo-router";

export default function MapsLayout() {
  return (
    <Stack>
      {/* The (tabs) group — shows normally */}
      <Stack.Screen name="MapLayout" options={{ headerShown: false }} />

      {/* Search screen — no header, full screen modal-style */}
      <Stack.Screen
        name="search"
        options={{
          headerShown: false,
          presentation: "card",
          animation: "slide_from_right",
        }}
      />

      {/* Saved screen — no header, full screen modal-style */}
      <Stack.Screen
        name="saved"
        options={{
          headerShown: false,
          presentation: "card",
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
