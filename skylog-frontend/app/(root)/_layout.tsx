import { useAuth, useUser } from "@clerk/expo";
import { Redirect, Slot } from "expo-router";
import { useEffect } from "react";
import { useSupabase } from "../../hooks/useSupabase";
import { upsertProfile } from "../../Services/ProfileService";

export default function RoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { client } = useSupabase();

  useEffect(() => {
    const syncProfile = async () => {
      if (!isSignedIn || !user) return;

      try {
        console.log("🔥 Syncing profile for:", user.id);
        const supabaseClient = await client();
        await upsertProfile(supabaseClient, {
          id: user.id,
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
          primaryEmailAddress: {
            emailAddress: user.primaryEmailAddress?.emailAddress,
          },
          imageUrl: user.imageUrl,
        });
      } catch (err) {
        console.error("Profile sync failed:", err);
      }
    };

    syncProfile();
  }, [isSignedIn, user, client]);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href={"/signIn"} />;
  }

  return <Slot />;
}
