import Stack from "expo-router/stack";

export default function ListingLayout() {
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
                headerShown: false,
                title: "Edit Listing",
                headerBackButtonDisplayMode: "minimal",
            }}
            />
        </Stack>
    )
}