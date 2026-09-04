import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocation } from "../../../hooks/useLocation";
import { useWeatherData } from "../../../hooks/useWeatherData";

let MapView: any,
  Marker: any,
  PROVIDER_GOOGLE: any = null;

if (Platform.OS !== "web") {
  (async () => {
    try {
      const MapsModule = await import("react-native-maps");
      MapView = MapsModule.default;
      Marker = MapsModule.Marker;
      PROVIDER_GOOGLE = MapsModule.PROVIDER_GOOGLE;
    } catch (e) {
      console.warn("Maps failed to load dynamically:", e);
    }
  })();
}

const stormyMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#112233" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#3a3a3a" }],
  },
];

const sunnyMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#a3ccff" }],
  },
];

export default function Maps() {
  const { coords, errorMsg, loading: locationLoading } = useLocation();
  const {
    weather,
    loading: weatherLoading,
    weatherError,
  } = useWeatherData(coords);

  const router = useRouter();

  // Added a default handler for the search button to prevent unexpected behaviors
  const handleSearchPress = () => {
    router.push("/(root)/(Maps)/Search");
  };

  const handleSavedPress = () => {
    router.push("/(root)/(Maps)/Saved");
  };

  if (locationLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={styles.loadingText}>
          Fetching your location geographical details...
        </Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>📍</Text>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Text style={styles.errorSub}>
          Please enable location permissions in settings.
        </Text>
      </View>
    );
  }

  if (weatherError) {
    // Degrade gracefully: show location/map, but don't block the UI.
    console.warn("Weather error:", weatherError);
  }

  if (weatherLoading && !weather) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={styles.loadingText}>Fetching current weather...</Text>
      </View>
    );
  }

  if (!coords) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Location unavailable.</Text>
      </View>
    );
  }

  const currentCondition = weather?.condition || "Clear";
  const getMapStyle = () => {
    if (currentCondition === "Rain" || currentCondition === "Thunderstorm") {
      return stormyMapStyle;
    }
    return sunnyMapStyle; // default layout
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        {Platform.OS === "web" ? (
          <View style={styles.centered}>
            <Text style={styles.cardText}>
              Maps are not supported on Web layout platforms.
            </Text>
          </View>
        ) : (
          <MapView
            style={styles.map}
            customMapStyle={getMapStyle()}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            <Marker
              coordinate={{
                latitude: coords.latitude,
                longitude: coords.longitude,
              }}
              title="Current Weather Location"
              description={`${currentCondition} - ${weather?.temperature}°C`}
            />
          </MapView>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Current Location</Text>
          <View style={styles.rowContainer}>
            <Text style={styles.cardText}>
              Lat: {coords.latitude.toFixed(6)}
            </Text>
            <Text style={styles.cardText}>
              Lng: {coords.longitude.toFixed(6)}
            </Text>
          </View>
          <Text style={styles.cardText}>
            Temperature: {weather?.temperature}°C
          </Text>
          <Text style={styles.cardText}>Condition: {weather?.condition}</Text>
          <Text style={styles.cardText}>Humidity: {weather?.humidity}</Text>
          <Text style={styles.cardText}>
            AQI:{" "}
            <Text style={{ color: weather?.aqiColor, fontWeight: "700" }}>
              {weather?.aqi}
            </Text>{" "}
          </Text>
          <Text style={styles.cardText}>Wind: {weather?.windSpeed} </Text>
        </View>

        {/* FIXED: Added missing quote and linked the onPress handler */}
        <TouchableOpacity style={styles.search} onPress={handleSearchPress}>
          <FontAwesome name="search" size={20} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.save} onPress={handleSavedPress}>
          <FontAwesome name="bookmark" size={20} color="#ff0000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 20,
    alignItems: "center",
    marginBottom: 4,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#e53e3e",
    fontWeight: "600",
    textAlign: "center",
  },
  errorSub: {
    marginTop: 8,
    fontSize: 13,
    color: "#888",
    textAlign: "center",
  },
  card: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  search: {
    position: "absolute",
    bottom: 220, // Bumped slightly to clear the info card cleanly
    right: 20,
    backgroundColor: "white",
    borderRadius: 25,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  save: {
    position: "absolute",
    bottom: 280, // Bumped slightly to clear the info card cleanly
    right: 20,
    backgroundColor: "white",
    borderRadius: 25,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    color: "#1a1a1a",
  },
  cardText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#1e90ff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    width: 180, // Expanded slightly to prevent layout compression
    height: 50,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
