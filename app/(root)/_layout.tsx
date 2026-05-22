import { useAuth } from "@clerk/expo";
import { Redirect, Slot } from "expo-router";

export default function RoutLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  //sync clerk user -> supabase(well buid this later)

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href={"/signIn"} />;
  }

  return <Slot />;
}
