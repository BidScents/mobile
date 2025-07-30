import { useLocalSearchParams } from "expo-router";
import { Text, YStack } from "tamagui";
import { useListingDetail } from "../../hooks/queries/use-listing";

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, error } = useListingDetail(id!);

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading listing</Text>;
  if (!listing) return <Text>Listing not found</Text>;

  return <YStack>{/* Your comprehensive listing UI */}</YStack>;
}