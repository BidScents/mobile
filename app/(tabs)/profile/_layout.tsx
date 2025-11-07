import { BackButton } from "@/components/ui/back-button";
import { Stack } from "expo-router";
import { useThemeColors } from "../../../hooks/use-theme-colors";

export default function ProfileLayout() {
  const colors = useThemeColors();
  return (
    <Stack
    screenOptions={{
      headerShown: true,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTitleStyle: {
        color: colors.foreground,
      },
      headerLeft: () => <BackButton />,
    }}
    
    >
      <Stack.Screen name="index" options={{ title: "Profile", headerLeft: () => null }} />
      <Stack.Screen name="[id]" options={{ title: "Profile", headerShown: false }} />
      <Stack.Screen name="favourite-listings" options={{ title: "Favourite Listings" }} />
      <Stack.Screen name="orders" options={{ title: "Orders" }} />
      <Stack.Screen name="seller-dashboard" options={{ title: "Seller Dashboard" }} />
      <Stack.Screen name="settings" options={{ title: "Settings", headerShown: false }} />
      <Stack.Screen name="help" options={{ title: "Help" }} />
      <Stack.Screen name="edit-profile" options={{ title: "Edit Profile", headerLargeTitle: true }} />
      <Stack.Screen name="report-profile" options={{ title: "Report Profile", headerLargeTitle: true }} />
    </Stack>
  );
}
