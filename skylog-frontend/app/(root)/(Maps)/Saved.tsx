import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef } from "react";
import {
  Alert,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSavedLocations } from "../../../context/savedLocationsService";
import { LocationSuggestion } from "./Search";

export default function SavedScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const {
    savedLocations: rawLocations,
    removeLocation,
    clearAllLocations,
    isLoading,
  } = useSavedLocations();

  // ✅ Hard guarantee — even if context somehow gives undefined, we never crash
  const locations: LocationSuggestion[] = Array.isArray(rawLocations)
    ? rawLocations
    : [];

  const handleRemove = (item: LocationSuggestion) => {
    Alert.alert(
      "Remove Location",
      `Remove "${item.name}" from saved locations?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeLocation(item.id),
        },
      ],
    );
  };

  const handleClearAll = () => {
    if (locations.length === 0) return;
    Alert.alert("Clear All", "Remove all saved locations?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: () => clearAllLocations(),
      },
    ]);
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: LocationSuggestion;
    index: number;
  }) => {
    const itemFade = new Animated.Value(0);
    Animated.timing(itemFade, {
      toValue: 1,
      duration: 300,
      delay: index * 60,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View style={{ opacity: itemFade }}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() =>
            router.push({
              pathname: "/(root)/(Maps)/MapLayout",
              params: {
                savedLat: item.latitude.toString(),
                savedLng: item.longitude.toString(),
                savedName: item.name,
              },
            })
          }
        >
          <View style={styles.locationCard}>
            <View style={styles.cardLeft}>
              <View style={styles.markerIcon}>
                <FontAwesome name="map-marker" size={16} color="#fff" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.locationName}>{item.name}</Text>
                <Text style={styles.locationSub} numberOfLines={1}>
                  {item.fullName}
                </Text>
                <View style={styles.coordRow}>
                  <Text style={styles.coordText}>
                    {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleRemove(item)}
              style={styles.deleteBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <FontAwesome name="trash-o" size={17} color="#e53e3e" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(root)/(tabs)/Maps")}
          style={styles.backBtn}
        >
          <FontAwesome name="arrow-left" size={18} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Locations</Text>
        <TouchableOpacity
          onPress={handleClearAll}
          style={[
            styles.clearBtn,
            locations.length === 0 && styles.clearBtnDisabled,
          ]}
          disabled={locations.length === 0}
        >
          <Text
            style={[
              styles.clearText,
              locations.length === 0 && styles.clearTextDisabled,
            ]}
          >
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      {/* Counter badge */}
      {locations.length > 0 && (
        <Animated.View style={[styles.countBadge, { opacity: fadeAnim }]}>
          <FontAwesome name="bookmark" size={12} color="#1e90ff" />
          <Text style={styles.countText}>
            {locations.length} saved location{locations.length !== 1 ? "s" : ""}
          </Text>
        </Animated.View>
      )}

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* ✅ Show loading skeleton while fetching */}
        {isLoading ? (
          <View style={styles.emptyState}>
            <FontAwesome name="spinner" size={32} color="#cbd5e0" />
            <Text style={styles.emptyTitle}>Loading…</Text>
          </View>
        ) : locations.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <FontAwesome name="bookmark-o" size={44} color="#cbd5e0" />
            </View>
            <Text style={styles.emptyTitle}>No saved locations</Text>
            <Text style={styles.emptyText}>
              Search for a location and tap Save Location to add it here.
            </Text>
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => router.push("/(root)/(Maps)/Search")}
            >
              <FontAwesome name="search" size={14} color="#fff" />
              <Text style={styles.searchBtnText}>Search Locations</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={locations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>

      {locations.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/(root)/(Maps)/Search")}
          activeOpacity={0.85}
        >
          <FontAwesome name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fc" },
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
  clearBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  clearBtnDisabled: { opacity: 0.3 },
  clearText: { fontSize: 14, color: "#e53e3e", fontWeight: "600" },
  clearTextDisabled: { color: "#aaa" },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
  },
  countText: { fontSize: 13, color: "#1e90ff", fontWeight: "600" },
  listContent: { padding: 16, paddingBottom: 80 },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardLeft: { flex: 1, flexDirection: "row", alignItems: "center" },
  markerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1e90ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  locationName: { fontSize: 15, fontWeight: "700", color: "#1a1a2e" },
  locationSub: { fontSize: 12, color: "#888", marginTop: 2 },
  coordRow: { marginTop: 4 },
  coordText: { fontSize: 11, color: "#bbb", fontWeight: "500" },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff5f5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#f7f9fc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#e8edf3",
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#a0aec0",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1e90ff",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#1e90ff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1e90ff",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});
