import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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
  // ✅ Read params passed from Saved screen
  const { savedLat, savedLng, savedName } = useLocalSearchParams<{
    savedLat?: string;
    savedLng?: string;
    savedName?: string;
  }>();

  const router = useRouter();

  // Determine if we're viewing a saved location or the user's live GPS
  const isSavedMode = !!(savedLat && savedLng);

  const savedCoords = isSavedMode
    ? {
        latitude: parseFloat(savedLat!),
        longitude: parseFloat(savedLng!),
      }
    : null;

  // GPS location (always fetched, used as fallback)
  const {
    coords: gpsCoords,
    errorMsg,
    loading: locationLoading,
  } = useLocation();

  // Use saved coords if available, otherwise GPS
  const activeCoords = savedCoords ?? gpsCoords;

  const { weather, loading: weatherLoading } = useWeatherData(activeCoords);

  // In saved mode, map opens immediately. In GPS mode, user taps button.
  const [openMap, setOpenMap] = useState(isSavedMode);

  if ((locationLoading || weatherLoading) && !isSavedMode) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>
          Fetching your location geographical details...
        </Text>
      </View>
    );
  }

  if (errorMsg && !isSavedMode) {
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

  if (!activeCoords) {
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
    return sunnyMapStyle;
  };

  // Label shown in the card and marker
  const locationLabel = isSavedMode
    ? (savedName ?? "Saved Location")
    : "📍 Current Location";

  return (
    <SafeAreaView style={styles.container}>
      {!openMap ? (
        <View style={styles.centered}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setOpenMap(true)}
          >
            <Text style={styles.buttonText}>Open Weather Map</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
                latitude: activeCoords.latitude,
                longitude: activeCoords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              showsUserLocation={!isSavedMode} // show blue dot only in GPS mode
              showsMyLocationButton={!isSavedMode}
            >
              <Marker
                coordinate={{
                  latitude: activeCoords.latitude,
                  longitude: activeCoords.longitude,
                }}
                title={locationLabel}
                description={`${currentCondition} - ${weather?.temperature}°C`}
              />
            </MapView>
          )}

          {/* ✅ Back button — only shown in saved mode */}
          {isSavedMode && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <FontAwesome name="arrow-left" size={16} color="#333" />
            </TouchableOpacity>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{locationLabel}</Text>
            <View style={styles.rowContainer}>
              <Text style={styles.cardText}>
                Lat: {activeCoords.latitude.toFixed(6)}
              </Text>
              <Text style={styles.cardText}>
                Lng: {activeCoords.longitude.toFixed(6)}
              </Text>
            </View>
            {weatherLoading ? (
              <ActivityIndicator size="small" color="#4A90E2" />
            ) : (
              <>
                <Text style={styles.cardText}>
                  Temperature: {weather?.temperature}°C
                </Text>
                <Text style={styles.cardText}>
                  Condition: {weather?.condition}
                </Text>
                <Text style={styles.cardText}>
                  Humidity: {weather?.humidity}
                </Text>
                <Text style={styles.cardText}>
                  AQI:{" "}
                  <Text style={{ color: weather?.aqiColor, fontWeight: "700" }}>
                    {weather?.aqi}
                  </Text>
                </Text>
                <Text style={styles.cardText}>Wind: {weather?.windSpeed}</Text>
              </>
            )}
          </View>

          {/* Search + Save buttons — hidden in saved mode to keep UI clean */}
          {!isSavedMode && (
            <>
              <TouchableOpacity
                style={styles.search}
                onPress={() => router.push("/(root)/(Maps)/Search")}
              >
                <FontAwesome name="search" size={20} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.save}
                onPress={() => router.push("/(root)/(Maps)/Saved")}
              >
                <FontAwesome name="bookmark" size={20} color="#ff0000" />
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
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
  // ✅ Back button positioned top-left over the map
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
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
  search: {
    position: "absolute",
    bottom: 220,
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
    bottom: 280,
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
    width: 180,
    height: 50,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
