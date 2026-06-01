import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getSavedLocations,
  saveLocation,
} from "../../../context/savedLocationsService";

export type LocationSuggestion = {
  id: string;
  name: string;
  fullName: string;
  latitude: number;
  longitude: number;
  country: string;
  state?: string;
};

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<LocationSuggestion | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
    loadSavedIds();
  }, [fadeAnim, slideAnim]);

  const loadSavedIds = async () => {
    const saved = await getSavedLocations();
    setSavedIds(new Set(saved.map((l) => l.id)));
  };

  const fetchSuggestions = async (text: string) => {
    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        text,
      )}&format=json&addressdetails=1&limit=8&featuretype=city,state,country`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": "WeatherApp/1.0",
          "Accept-Language": "en",
        },
      });
      const data = await res.json();

      const mapped: LocationSuggestion[] = data.map((item: any) => {
        const addr = item.address || {};
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.county ||
          addr.state_district ||
          "";
        const state = addr.state || addr.region || "";
        const country = addr.country || "";

        const nameParts = [city, state, country].filter(Boolean);
        const uniqueParts = [...new Set(nameParts)];

        return {
          id: item.place_id?.toString() || Math.random().toString(),
          name: city || state || item.display_name.split(",")[0],
          fullName: uniqueParts.join(", "),
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          country,
          state,
        };
      });

      // Deduplicate by fullName
      const seen = new Set<string>();
      const unique = mapped.filter((s) => {
        if (seen.has(s.fullName)) return false;
        seen.add(s.fullName);
        return true;
      });

      setSuggestions(unique);
    } catch (e) {
      console.warn("Geocoding fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 400);
  };

  const handleSelect = (item: LocationSuggestion) => {
    setSelected(item);
    setQuery(item.fullName);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const handleSave = async () => {
    if (!selected) return;
    if (savedIds.has(selected.id)) {
      Alert.alert(
        "Already Saved",
        `"${selected.name}" is already in your saved locations.`,
      );
      return;
    }
    await saveLocation(selected);
    setSavedIds((prev) => new Set([...prev, selected.id]));
    Alert.alert(
      "Saved!",
      `"${selected.name}" has been saved to your locations.`,
      [
        {
          text: "View Saved",
          onPress: () => router.push("/(root)/(Maps)/Saved"),
        },
        { text: "OK" },
      ],
    );
  };

  const isAlreadySaved = selected ? savedIds.has(selected.id) : false;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <FontAwesome name="arrow-left" size={18} color="#1a1a2e" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Location</Text>
          <TouchableOpacity
            onPress={() => router.push("/(root)/(Maps)/Saved")}
            style={styles.savedBtn}
          >
            <FontAwesome name="bookmark" size={18} color="#e53e3e" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.searchBox,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <FontAwesome
            name="search"
            size={16}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search cities, states, countries…"
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={handleChangeText}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                setSuggestions([]);
                setSelected(null);
                inputRef.current?.focus();
              }}
            >
              <FontAwesome name="times-circle" size={16} color="#ccc" />
            </TouchableOpacity>
          )}
          {loading && (
            <ActivityIndicator
              size="small"
              color="#4A90E2"
              style={{ marginLeft: 8 }}
            />
          )}
        </Animated.View>

        {/* Suggestions List */}
        {suggestions.length > 0 && (
          <Animated.View
            style={[styles.suggestionsCard, { opacity: fadeAnim }]}
          >
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.suggestionIcon}>
                    <FontAwesome name="map-marker" size={14} color="#4A90E2" />
                  </View>
                  <View style={styles.suggestionText}>
                    <Text style={styles.suggestionName}>{item.name}</Text>
                    <Text style={styles.suggestionSub} numberOfLines={1}>
                      {[item.state, item.country].filter(Boolean).join(", ")}
                    </Text>
                  </View>
                  {savedIds.has(item.id) && (
                    <FontAwesome name="bookmark" size={12} color="#e53e3e" />
                  )}
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        )}

        {/* Selected Location Card */}
        {selected && (
          <Animated.View style={[styles.selectedCard, { opacity: fadeAnim }]}>
            <View style={styles.selectedHeader}>
              <View style={styles.selectedIconWrap}>
                <FontAwesome name="map-marker" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedName}>{selected.name}</Text>
                <Text style={styles.selectedSub}>{selected.fullName}</Text>
              </View>
            </View>
            <View style={styles.coordsRow}>
              <View style={styles.coordBadge}>
                <Text style={styles.coordLabel}>LAT</Text>
                <Text style={styles.coordValue}>
                  {selected.latitude.toFixed(5)}
                </Text>
              </View>
              <View style={styles.coordBadge}>
                <Text style={styles.coordLabel}>LNG</Text>
                <Text style={styles.coordValue}>
                  {selected.longitude.toFixed(5)}
                </Text>
              </View>
              {selected.country && (
                <View style={styles.coordBadge}>
                  <Text style={styles.coordLabel}>COUNTRY</Text>
                  <Text style={styles.coordValue} numberOfLines={1}>
                    {selected.country}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, isAlreadySaved && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={isAlreadySaved}
            >
              <FontAwesome
                name={isAlreadySaved ? "check" : "bookmark"}
                size={15}
                color="#fff"
              />
              <Text style={styles.saveBtnText}>
                {isAlreadySaved ? "Already Saved" : "Save Location"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Empty state */}
        {!loading &&
          suggestions.length === 0 &&
          !selected &&
          query.length === 0 && (
            <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
              <FontAwesome name="globe" size={52} color="#e2e8f0" />
              <Text style={styles.emptyTitle}>Find any location</Text>
              <Text style={styles.emptyText}>
                Search for cities, states, or countries to save them for quick
                weather access.
              </Text>
            </Animated.View>
          )}

        {!loading &&
          suggestions.length === 0 &&
          query.length >= 2 &&
          !selected && (
            <View style={styles.emptyState}>
              <FontAwesome name="search" size={40} color="#e2e8f0" />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyText}>Try a different search term.</Text>
            </View>
          )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a2e",
    letterSpacing: 0.3,
  },
  savedBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e8edf3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1a1a2e",
    fontWeight: "500",
  },
  suggestionsCard: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e8edf3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    maxHeight: 320,
    overflow: "hidden",
  },
  separator: {
    height: 1,
    backgroundColor: "#f5f5f5",
    marginLeft: 48,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a2e",
  },
  suggestionSub: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  selectedCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  selectedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  selectedIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  selectedSub: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  coordsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  coordBadge: {
    flex: 1,
    backgroundColor: "#f7f9fc",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  coordLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#aaa",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  coordValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    paddingVertical: 13,
    gap: 8,
  },
  saveBtnDisabled: {
    backgroundColor: "#a0aec0",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2d3748",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#a0aec0",
    textAlign: "center",
    lineHeight: 21,
  },
});
