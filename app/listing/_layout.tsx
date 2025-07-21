import Stack from "expo-router/stack";

export default function ListingLayout() {
    return (
        <Stack>
            <Stack.Screen name="[id]" 
            options={{
                title: "Listing",
                headerBackButtonDisplayMode: "minimal",
            }}
            />
        </Stack>
    )
}