import { BackButton } from "@/components/ui/back-button";
import { Stack } from "expo-router";

export default function IndexLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "$background",
        },
        headerTitleStyle: {
          color: "$foreground",
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
