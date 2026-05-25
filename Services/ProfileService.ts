import type { SupabaseClient } from "@supabase/supabase-js";

type ClerkUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  primaryEmailAddress?: { emailAddress?: string };
  imageUrl?: string;
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
      },
      { onConflict: "clerk_user_id" },
    )
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from("alert_preferences")
    .upsert({ profile_id: data.id }, { onConflict: "profile_id" });

  return data;
}
