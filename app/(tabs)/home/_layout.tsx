import { BackButton } from "@/components/ui/back-button";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Stack } from "expo-router";

export default function IndexLayout() {
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
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="search-results"
        options={{
          headerShown: false,
          animation: "fade",
        }}
      />
    </Stack>
  );
}
