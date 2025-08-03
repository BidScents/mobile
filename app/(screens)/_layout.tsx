import { CloseButton } from "@/components/ui/close-button";
import { Stack } from "expo-router";

export default function ProfileLayout() {
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
      }}
    >
      <Stack.Screen
        name="add-listing"
        options={{
          headerShadowVisible: false,
          animation: "slide_from_bottom",
          headerLeft: () => <CloseButton />,
        }}
      />
    </Stack>
  );
}
