import { ListingCard } from "@/components/listing/listing-card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { useUserFavorites } from "@/hooks/queries/use-listing";
import { useLoadingStore } from "@bid-scents/shared-sdk";
import { LegendList } from "@legendapp/list";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useEffect } from "react";

export default function FavouriteListingsScreen() {
  const tabBarHeight = useBottomTabBarHeight();
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
      <EmptyState
        title="No Favourites"
        description="You have no favourite listings yet."
      />
    );
  }

  return (
    <Container variant="padded" safeArea={false} backgroundColor="$background">
      <LegendList
        data={listings || []}
        renderItem={({ item }) => <ListingCard listing={item} />}
        keyExtractor={(item) => item.id}
        estimatedItemSize={200}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        recycleItems
        contentContainerStyle={{
          paddingBottom: tabBarHeight,
          gap: 6
        }}
        columnWrapperStyle={{
          gap: 6
        }}
      />
    </Container>
  );
}
