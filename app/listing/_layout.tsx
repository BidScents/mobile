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
            <Stack.Screen name="[id]" 
            options={{
                headerShown: false,
                title: "Listing",
                headerBackButtonDisplayMode: "minimal",
            }}
            />
        </Stack>
    )
}