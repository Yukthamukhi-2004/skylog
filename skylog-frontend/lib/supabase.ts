// lib/supabase.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

// Guard initialization so it doesn't crash the entire app bundle if variables are late loading
export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : (null as any);

export function getSupabaseWithToken(token: string) {
  // If the key isn't loaded globally, try parsing it directly during the function call invocation
  const url = supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL!;
  const key = supabaseKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(url, key, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
