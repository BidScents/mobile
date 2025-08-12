import { useUserFavorites } from "@/hooks/queries/use-listing";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { Redirect } from "expo-router";
import { View } from "react-native";
import { Spinner } from "tamagui";

export default function RootIndex() {
  /**
   * Component to initialize startup actions within the app context
   * Should be placed high in the component tree after authentication is set up
   */
  function StartupInitializer() {
    console.log("Initializing startup actions.....");

    // Initialize notifications (includes device token registration)
    useNotifications();

    // Initialize user favorites
    useUserFavorites();

    return null;
  }

  const { isAuthenticated, isOnboarded, loading } = useAuthStore();

  // Show loading while checking auth state
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Spinner size="large" color="$foreground" />
      </View>
    );
  }

  // Redirect based on auth state
  if (isAuthenticated && isOnboarded) {
    return (
      <>
        <StartupInitializer />
        <Redirect href="/(tabs)" />
      </>
    );
  }

  if (isAuthenticated && !isOnboarded) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href="/(auth)" />;
}
