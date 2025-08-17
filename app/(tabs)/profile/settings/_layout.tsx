import { BackButton } from "@/components/ui/back-button";
import { Stack } from "expo-router";
import { useTheme } from "tamagui";

export default function SettingsLayout() {
  const theme = useTheme();
  return (
    <Stack
    screenOptions={{
      headerShown: true,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: theme.background.get(),
      },
      headerTitleStyle: {
        color: theme.foreground.get(),
      },
      headerLeft: () => <BackButton />,
    }}
    
    >
      <Stack.Screen name="index" options={{ title: "Settings"}} />
      <Stack.Screen name="notification-preferences" options={{ title: "Notification Preferences"}} />
    </Stack>
  );
}
