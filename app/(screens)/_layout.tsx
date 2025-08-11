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
          title: "Add Listing",
          animation: "slide_from_bottom",
          headerLeft: () => <CloseButton />,
        }}
      />
    </Stack>
  );
}
