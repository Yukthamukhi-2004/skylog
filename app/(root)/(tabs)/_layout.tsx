import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#007AFF", // Vibrant active blue
        tabBarInactiveTintColor: "#8E8E93", // Muted gray
        tabBarStyle: {
          backgroundColor: "#121212", // Match your dark theme
          borderTopWidth: 1,
          borderTopColor: "#1E1E1E",
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
        },
        headerShown: false, // Hides default header so you can use custom ones
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Analysis"
        options={{
          title: "Analysis",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Maps"
        options={{
          title: "Maps",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="location-arrow" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
