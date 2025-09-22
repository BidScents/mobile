import { ListingCardSkeleton } from '@/components/suspense/listing-card-skeleton';
import { Button } from '@/components/ui/button';
import { ThemedIonicons } from '@/components/ui/themed-icons';
import { useActiveListings } from '@/hooks/queries/use-dashboard';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { ListingPreview } from '@bid-scents/shared-sdk';
import { LegendList } from '@legendapp/list';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';
import { Text, View } from 'tamagui';
import { ListingDashboardCard } from './listing-dashboard-card';

const MemoizedListingCard = React.memo(ListingDashboardCard);
const MemoizedListingCardSkeleton = React.memo(ListingCardSkeleton);

const GAP_SIZE = 12; // Same as search results

interface ActiveViewProps {
  isSelectMode: boolean;
  selectedListings: Set<string>;
  setSelectedListings: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export default function ActiveView({ 
  isSelectMode, 
  selectedListings, 
  setSelectedListings 
}: ActiveViewProps) {
  const [canLoadMore, setCanLoadMore] = useState(false);
  const tabbarHeight = useBottomTabBarHeight();
  const colors = useThemeColors();

  const {data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch, isRefetching, error} = useActiveListings();
  
  // Flatten the paginated data
  const flatListings = data?.pages.flatMap(page => page.listings) || [];
  const totalFound = data?.pages[0]?.pagination_data.found || 0;

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

  // Handle listing selection
  const handleListingSelect = useCallback((listing: ListingPreview) => {
    setSelectedListings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(listing.id)) {
        newSet.delete(listing.id);
      } else {
        newSet.add(listing.id);
      }
      return newSet;
    });
  }, [setSelectedListings]);

  // Render listing item
  const renderListingItem = useCallback(({ item, index }: { item: ListingPreview, index: number }) => {
    const isLeftColumn = index % 2 === 0;
    const isSelected = selectedListings.has(item.id);
    
    return (
      <View 
        style={{
          paddingLeft: isLeftColumn ? 0 : GAP_SIZE / 2,
          paddingRight: isLeftColumn ? GAP_SIZE / 2 : 0,
          paddingBottom: GAP_SIZE,
        }}
      >
        <MemoizedListingCard 
          listing={item} 
          isSelectMode={isSelectMode}
          isSelected={isSelected}
          onSelect={handleListingSelect}
        />
      </View>
    );
  }, [isSelectMode, selectedListings, handleListingSelect]);

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
      <View flex={1} justifyContent="center" alignItems="center" paddingHorizontal="$6">
        <ThemedIonicons 
          name="alert-circle-outline" 
          size={64} 
          color={colors.mutedForeground} 
          style={{ marginBottom: 16 }} 
        />
        <Text fontSize="$6" fontWeight="600" color="$foreground" textAlign="center" marginBottom="$2">
          Something went wrong
        </Text>
        <Text fontSize="$4" color="$mutedForeground" textAlign="center" marginBottom="$4">
          We couldn&apos;t load your active listings. Please try again.
        </Text>
        <Button variant="secondary" onPress={handleRefresh}>
          Try Again
        </Button>
      </View>
    );
  }

  // Empty state
  if (!flatListings || flatListings.length === 0) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" paddingHorizontal="$6">
        <ThemedIonicons 
          name="storefront-outline" 
          size={64} 
          color={colors.mutedForeground} 
          style={{ marginBottom: 16 }} 
        />
        <Text fontSize="$6" fontWeight="600" color="$foreground" textAlign="center" marginBottom="$2">
          No Active Listings
        </Text>
        <Text fontSize="$4" color="$mutedForeground" textAlign="center" marginBottom="$4">
          You don&apos;t have any active listings yet. Create your first listing to start selling.
        </Text>
        <Button variant="primary" onPress={() => {/* TODO: Navigate to create listing */}}>
          Create Listing
        </Button>
      </View>
    );
  }

  // Results list
  return (
    <View flex={1}>
      <LegendList
        key={`${isSelectMode}-${selectedListings.size}`} // TODO Maby change the key for the individual listing cards??
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
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
          />
        }
        ListFooterComponent={renderFooter}
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: tabbarHeight }}
      />
    </View>
  );
}