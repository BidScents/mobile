import { BackButton } from "@/components/ui/back-button";
import { CloseButton } from "@/components/ui/close-button";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Stack } from "expo-router";

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
      <Stack.Screen
        name="(chat)/[id]"
        options={{
          title: "Chat",
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="user/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="subscription-paywall"
        options={{
          title: "Subscriptions",
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="(followers)/[id]"
        options={{
          title: "Followers",
          headerLeft: () => <BackButton />,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="(following)/[id]"
        options={{
          title: "Following",
          headerLeft: () => <BackButton />,
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
