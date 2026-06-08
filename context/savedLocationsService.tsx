import { useAuth } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, useCallback, useContext } from "react";
import { useSupabase } from "../hooks/useSupabase";

export type LocationSuggestion = {
  id: string;
  name: string;
  fullName: string;
  latitude: number;
  longitude: number;
  country: string;
  state?: string;
  savedAt?: number;
};

type SavedLocationsContextType = {
  savedLocations: LocationSuggestion[];
  saveLocation: (loc: LocationSuggestion) => Promise<void>;
  removeLocation: (id: string) => void;
  isLocationSaved: (latitude: number, longitude: number) => boolean;
  clearAllLocations: () => void;
  isLoading: boolean;
};

const SavedLocationsContext = createContext<SavedLocationsContextType>({
  savedLocations: [],
  saveLocation: async () => {},
  removeLocation: () => {},
  isLocationSaved: () => false,
  clearAllLocations: () => {},
  isLoading: false,
});

export const SavedLocationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { client } = useSupabase();
  const queryClient = useQueryClient();
  const { isLoaded, isSignedIn, userId } = useAuth();

  const getProfileId = async (supabase: any): Promise<string> => {
    console.log(
      "[SavedLocations] Looking up profile for clerk_user_id:",
      userId,
    );

    const { data: existing, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (fetchError) {
      console.error(
        "[SavedLocations] Profile fetch error:",
        JSON.stringify(fetchError),
      );
      throw fetchError;
    }

    if (existing) {
      console.log("[SavedLocations] Found profile id:", existing.id);
      return existing.id;
    }

    console.warn("[SavedLocations] No profile found — creating one");

    const { data: created, error: createError } = await supabase
      .from("profiles")
      .insert({
        clerk_user_id: userId,
        timezone: "Asia/Kolkata",
        dark_mode: false,
        offline_mode: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (createError) {
      console.error(
        "[SavedLocations] Profile create error:",
        JSON.stringify(createError),
      );
      throw createError;
    }

    console.log("[SavedLocations] Created profile id:", created.id);
    return created.id;
  };

  const { data: savedLocations = [], isLoading } = useQuery({
    queryKey: ["saved_locations", userId],
    queryFn: async () => {
      console.log("[SavedLocations] Fetching locations for userId:", userId);
      const supabase = await client();
      const profileId = await getProfileId(supabase);

      const { data, error } = await supabase
        .from("saved_locations")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[SavedLocations] Fetch error:", JSON.stringify(error));
        throw error;
      }

      console.log("[SavedLocations] Fetched", data.length, "locations");
      return data.map((item: any) => ({
        id: item.id,
        name: item.city || item.label?.split(",")[0] || "",
        fullName: item.label || "",
        latitude: item.latitude,
        longitude: item.longitude,
        country: item.country || "",
        state: item.timezone || item.state || "",
        savedAt: new Date(item.created_at).getTime(),
      })) as LocationSuggestion[];
    },
    enabled: isLoaded && isSignedIn && !!userId,
    staleTime: 30_000,
  });

  const saveMutation = useMutation({
    mutationFn: async (loc: LocationSuggestion) => {
      console.log(
        "[SavedLocations] Saving location:",
        loc.name,
        loc.latitude,
        loc.longitude,
      );
      const supabase = await client();
      const profileId = await getProfileId(supabase);
      console.log("[SavedLocations] Using profile_id:", profileId);

      // Check duplicate
      const { data: existing } = await supabase
        .from("saved_locations")
        .select("id")
        .eq("profile_id", profileId)
        .eq("latitude", loc.latitude)
        .eq("longitude", loc.longitude)
        .maybeSingle();

      if (existing) {
        console.log("[SavedLocations] Already exists, skipping insert");
        return;
      }

      const insertPayload = {
        profile_id: profileId,
        label: loc.fullName,
        latitude: loc.latitude,
        longitude: loc.longitude,
        city: loc.name,
        country: loc.country,
        timezone: loc.state || "Asia/Kolkata",
      };
      console.log("[SavedLocations] Inserting:", JSON.stringify(insertPayload));

      const { data: inserted, error } = await supabase
        .from("saved_locations")
        .insert(insertPayload)
        .select(); // ✅ select() forces it to return the inserted row + any errors

      if (error) {
        console.error("[SavedLocations] Insert error:", JSON.stringify(error));
        throw error;
      }

      console.log("[SavedLocations] Insert success:", JSON.stringify(inserted));
    },
    onSuccess: () => {
      console.log("[SavedLocations] Invalidating query cache");
      queryClient.invalidateQueries({ queryKey: ["saved_locations", userId] });
    },
    onError: (error) => {
      console.error("[SavedLocations] Mutation error:", JSON.stringify(error));
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = await client();
      const { error } = await supabase
        .from("saved_locations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved_locations", userId] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const supabase = await client();
      const profileId = await getProfileId(supabase);
      const { error } = await supabase
        .from("saved_locations")
        .delete()
        .eq("profile_id", profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved_locations", userId] });
    },
  });

  const isLocationSaved = useCallback(
    (latitude: number, longitude: number) =>
      savedLocations.some(
        (l) =>
          Math.abs(l.latitude - latitude) < 0.001 &&
          Math.abs(l.longitude - longitude) < 0.001,
      ),
    [savedLocations],
  );

  return (
    <SavedLocationsContext.Provider
      value={{
        savedLocations,
        saveLocation: (loc) => saveMutation.mutateAsync(loc),
        removeLocation: (id) => removeMutation.mutate(id),
        clearAllLocations: () => clearAllMutation.mutate(),
        isLocationSaved,
        isLoading: isLoading || !isLoaded,
      }}
    >
      {children}
    </SavedLocationsContext.Provider>
  );
};

export const useSavedLocations = () => useContext(SavedLocationsContext);
export default SavedLocationsContext;
