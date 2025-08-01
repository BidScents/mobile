import { ListingCard } from "@/components/listing/listing-card";
import { Container } from "@/components/ui/container";
import { useUserFavorites } from "@/hooks/queries/use-listing";
import { FlashList } from "@shopify/flash-list";

export default function FavouriteListingsScreen() {
  const { data: listings, isLoading, error } = useUserFavorites();
  return (
    <Container variant="padded" safeArea={false} backgroundColor="$background">
      <FlashList
        data={listings || []}
        renderItem={({ item }) => <ListingCard listing={item} />}
        keyExtractor={(item) => item.id}
        estimatedItemSize={200}
        showsVerticalScrollIndicator={false}
        numColumns={2}
      />
    </Container>
  );
}
