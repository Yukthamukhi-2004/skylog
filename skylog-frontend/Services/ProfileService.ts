import type { SupabaseClient } from "@supabase/supabase-js";

type ClerkUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  primaryEmailAddress?: { emailAddress?: string };
  imageUrl?: string;
};

const getDeviceTimezone = () => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone || "UTC";
  } catch {
    return "UTC";
  }
};

export async function upsertProfile(
  supabase: SupabaseClient,
  clerkUser: ClerkUser,
) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        clerk_user_id: clerkUser.id,
        first_name: clerkUser.firstName,
        last_name: clerkUser.lastName,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        avatar_url: clerkUser.imageUrl,
        timezone: getDeviceTimezone(),
        dark_mode: false,
        offline_mode: false,
      },
      { onConflict: "clerk_user_id" },
    )
    .select()
    .single();

  if (error) {
    if ((error as any)?.code === "42501") {
      console.error(
        "Supabase RLS error inserting/updating profile. This often means the client is not authenticated or the table's RLS policy blocks inserts from the anon client. Use an authenticated client (JWT) or perform the write via a secure server.",
        error,
      );
    }

    throw error;
  }

  try {
    await supabase
      .from("alert_preferences")
      .upsert({ profile_id: data.id }, { onConflict: "profile_id" });
  } catch (alertErr) {
    console.error("Failed to upsert alert_preferences:", alertErr);
  }

  return data;
}
