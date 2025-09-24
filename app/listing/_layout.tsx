import { BackButton } from "@/components/ui/back-button";
import Stack from "expo-router/stack";
import { Platform } from "react-native";

export default function ListingLayout() {
    const isIOS = Platform.OS === "ios";
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