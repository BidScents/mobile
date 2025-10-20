import { BackButton } from "@/components/ui/back-button";
import { useThemeColors } from "@/hooks/use-theme-colors";
import Stack from "expo-router/stack";
import { Platform } from "react-native";

export default function ListingLayout() {
    const isIOS = Platform.OS === "ios";
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
            <Stack.Screen name="[id]/index" 
            options={{
                headerShown: false,
                title: "Listing",
                headerBackButtonDisplayMode: "minimal",
            }}
            />
            <Stack.Screen name="[id]/edit/index" 
            options={{
                title: "Edit Listing",
                headerLeft: () => <BackButton />,
                ...(isIOS && { headerLargeTitle: true }),
            }}
            />
        </Stack>
    )
}