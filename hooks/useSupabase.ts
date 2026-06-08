import { useAuth } from "@clerk/expo";
import { getSupabaseWithToken } from "../lib/supabase"; // Maps to lib/supabase.ts

export const useSupabase = () => {
  const { getToken } = useAuth();

  const client = async () => {
    // Fetches the secure JWT session token from Clerk
    const token = await getToken({ template: "supabase" });
    if (!token) throw new Error("User is not authenticated");

    // Generates an authenticated instance of Supabase
    return getSupabaseWithToken(token);
  };

  return { client };
};
