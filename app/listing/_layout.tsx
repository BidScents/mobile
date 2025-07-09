import Stack from "expo-router/stack";

export default function ListingLayout() {
    return (
        <Stack>
            <Stack.Screen name="[id]" 
            options={{
                title: "Listing",
                headerSearchBarOptions: {
                    placeholder: "Search listings",
                },
            }}
            />
        </Stack>
    )
}