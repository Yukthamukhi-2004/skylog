// Maps.web.tsx — web platform shim
// Metro automatically uses this file instead of Maps.tsx on web builds.
// react-native-maps uses native-only modules that cannot run on web.

import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function MapsWebFallback() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <FontAwesome name="map-o" size={52} color="#4A90E2" />
        </View>
        <Text style={styles.title}>Maps not available on Web</Text>
        <Text style={styles.subtitle}>
          The map view is only supported on iOS and Android. Please open the app
          on your mobile device to use this feature.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 36,
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#a0aec0",
    textAlign: "center",
    lineHeight: 22,
  },
});
