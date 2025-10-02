import { ListingCard } from '@/components/listing/listing-card';
import { ListingCardSkeleton } from '@/components/suspense/listing-card-skeleton';
import { useSellersYouFollowListings } from '@/hooks/queries/use-listing';
import { LegendList } from '@legendapp/list';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'tamagui';
import { SellersYouFollowEmptyState } from './sellers-you-follow-empty-state';

const MemoizedListingCard = React.memo(ListingCard);
const MemoizedListingCardSkeleton = React.memo(ListingCardSkeleton);

const GAP_SIZE = 12; // Same as homepage $3 gap

export const SellersYouFollowList = React.memo(function SellersYouFollowList() {
  const [canLoadMore, setCanLoadMore] = useState(false);
  const tabbarHeight = useBottomTabBarHeight();
  
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error
  } = useSellersYouFollowListings(20);

  // Flatten the paginated data and apply sorting
  const flatListings = React.useMemo(() => {
    const listings = data?.pages.flatMap(page => page.listings) || [];
    
    return listings;
  }, [data?.pages]);

  // Enable load more after initial render and when we have sufficient data
  useEffect(() => {
    const timer = setTimeout(() => {
      if (flatListings.length > 0) {
        setCanLoadMore(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [flatListings.length]);

  // Handle load more with proper throttling
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && canLoadMore) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, canLoadMore]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Render listing item
  const renderListingItem = useCallback(({ item, index }: { item: any, index: number }) => {
    const isLeftColumn = index % 2 === 0;
    
    return (
      <View 
        style={{
          paddingLeft: isLeftColumn ? 0 : GAP_SIZE / 2,
          paddingRight: isLeftColumn ? GAP_SIZE / 2 : 0,
          paddingBottom: GAP_SIZE,
        }}
      >
        <MemoizedListingCard listing={item} />
      </View>
    );
  }, []);

  // Render loading skeleton
  const renderSkeletonItem = useCallback(({ index }: { index: number }) => {
    const isLeftColumn = index % 2 === 0;
    
    return (
      <View 
        key={`skeleton-${index}`}
        style={{
          paddingLeft: isLeftColumn ? 0 : GAP_SIZE / 2,
          paddingRight: isLeftColumn ? GAP_SIZE / 2 : 0,
          paddingBottom: GAP_SIZE,
        }}
      >
        <MemoizedListingCardSkeleton />
      </View>
    );
  }, []);

  // Key extractor
  const keyExtractor = useCallback((item: any) => item.id, []);

  // Render loading footer
  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View paddingVertical="$4" flexDirection="row" style={{ gap: GAP_SIZE }}>
        <View style={{ flex: 1 }}>
          <MemoizedListingCardSkeleton />
        </View>
        <View style={{ flex: 1 }}>
          <MemoizedListingCardSkeleton />
        </View>
      </View>
    );
  }, [isFetchingNextPage]);

  // Loading state - show skeleton grid
  if (isLoading) {
    const skeletonData = Array.from({ length: 6 }, (_, index) => ({ id: index }));
    
    return (
      <LegendList
        data={skeletonData}
        renderItem={renderSkeletonItem}
        estimatedItemSize={260}
        numColumns={2}
        recycleItems
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: any) => `skeleton-${item.id}`}
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: tabbarHeight }}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <SellersYouFollowEmptyState
        type="error"
        title="Loading Error"
        message="Something went wrong while loading listings from sellers you follow. Please try again."
        onRetry={handleRefresh}
      />
    );
  }

  // Empty state
  if (!flatListings || flatListings.length === 0) {
    return (
      <SellersYouFollowEmptyState
        type="no-listings"
        title="No Listings Found"
        message="Sellers you follow haven't posted any listings yet. Follow more sellers or check back later!"
      />
    );
  }

  // Results list
  return (
    <View flex={1}>
      <LegendList
        data={flatListings}
        renderItem={renderListingItem}
        estimatedItemSize={260}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        keyExtractor={keyExtractor}
        drawDistance={500}
        recycleItems
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        onRefresh={refetch}
        ListFooterComponent={renderFooter}
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: tabbarHeight }}
      />
    </View>
  );
});