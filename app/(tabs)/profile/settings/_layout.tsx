import { BackButton } from "@/components/ui/back-button";
import { Stack } from "expo-router";
import { useThemeColors } from "../../../../hooks/use-theme-colors";

export default function SettingsLayout() {
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
      <Stack.Screen name="index" options={{ title: "Settings"}} />
      <Stack.Screen name="notification-preferences" options={{ title: "Notification Preferences"}} />
      <Stack.Screen name="theme" options={{ title: "Theme"}} />
    </Stack>
  );
}
