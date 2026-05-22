import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  // 1. If Clerk hasn't loaded authentication state yet, stop here!
  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) return <Redirect href="/(root)/(tabs)" />;

  // 2. Now it's completely safe to use isSignedIn or other logic
  return <Redirect href="/signIn" />;
}
