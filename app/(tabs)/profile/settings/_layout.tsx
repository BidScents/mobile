import { BackButton } from "@/components/ui/back-button";
import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack
    screenOptions={{
      headerShown: true,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '$background',
      },
      headerTitleStyle: {
        color: '$foreground',
      },
      headerLeft: () => <BackButton />,
    }}
    
    >
      <Stack.Screen name="index" options={{ title: "Settings"}} />
      <Stack.Screen name="notification-preferences" options={{ title: "Notification Preferences"}} />
    </Stack>
  );
}
