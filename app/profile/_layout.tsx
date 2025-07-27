import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ title: "Profile" }} />
      <Stack.Screen name="badges" options={{ title: "Badges" }} />
      <Stack.Screen name="favourite-listings" options={{ title: "Favourite Listings" }} />
      <Stack.Screen name="orders" options={{ title: "Orders" }} />
      <Stack.Screen name="seller-dashboard" options={{ title: "Seller Dashboard" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
      <Stack.Screen name="help" options={{ title: "Help" }} />
      <Stack.Screen name="about-us" options={{ title: "About Us" }} />
      <Stack.Screen name="legal" options={{ title: "Legal" }} />
    </Stack>
  );
}
