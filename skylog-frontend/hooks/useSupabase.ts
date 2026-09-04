import { useAuth } from "@clerk/expo";
import { useCallback } from "react";
import { getSupabaseWithToken } from "../lib/supabase"; // Maps to lib/supabase.ts

export const useSupabase = () => {
  const { getToken } = useAuth();

  const client = useCallback(async () => {
    // Fetches the secure JWT session token from Clerk
    const token = await getToken({ template: "supabase" });
    if (!token) throw new Error("User is not authenticated");

    // Generates an authenticated instance of Supabase
    return getSupabaseWithToken(token);
  }, [getToken]);

  return { client };
};
