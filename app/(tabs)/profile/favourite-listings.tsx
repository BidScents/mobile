import { ListingCard } from "@/components/listing/listing-card";
import { Container } from "@/components/ui/container";
import { useUserFavorites } from "@/hooks/queries/use-listing";
import { useLoadingStore } from "@bid-scents/shared-sdk";
import { FlashList } from "@shopify/flash-list";
import { useEffect } from "react";
import { Text, View } from "tamagui";

export default function FavouriteListingsScreen() {
  const { data: listings, isLoading } = useUserFavorites();
  const { showLoading, hideLoading } = useLoadingStore();

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  if (listings?.length === 0) {
    return (
      <View
        flex={1}
        justifyContent="center"
        alignItems="center"
        paddingHorizontal="$4"
        backgroundColor="$background"
      >
        <Text
          fontSize="$6"
          fontWeight="600"
          color="$mutedForeground"
          textAlign="center"
        >
          No Favourites
        </Text>
        <Text
          fontSize="$4"
          color="$mutedForeground"
          textAlign="center"
          marginTop="$2"
        >
          You have no favourite listings yet.
        </Text>
      </View>
    );
  }

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
