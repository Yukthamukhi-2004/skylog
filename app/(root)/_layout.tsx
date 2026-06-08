import { useAuth, useUser } from "@clerk/expo";
import { Redirect, Slot } from "expo-router";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase"; // adjust path if needed
import { upsertProfile } from "../../Services/ProfileService";

export default function RoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  //sync clerk user -> supabase(well buid this later)
  useEffect(() => {
    if (isSignedIn && user) {
      console.log("🔥 Syncing profile for:", user.id);
      upsertProfile(supabase, {
        id: user.id,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        primaryEmailAddress: {
          emailAddress: user.primaryEmailAddress?.emailAddress,
        },
        imageUrl: user.imageUrl,
      }).catch((err) => console.error("Profile sync failed:", err));
    }
  }, [isSignedIn, user]);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href={"/signIn"} />;
  }

  return <Slot />;
}
