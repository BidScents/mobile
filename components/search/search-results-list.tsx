import { ListingCard } from '@/components/listing/listing-card';
import { ListingCardSkeleton } from '@/components/suspense/listing-card-skeleton';
import { SearchRequest } from '@bid-scents/shared-sdk';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';
import { View } from 'tamagui';
import { useSearchListings } from '../../hooks/queries/use-search-listings';
import { SearchEmptyState } from './search-empty-state';

interface SearchResultsListProps {
  searchParams: SearchRequest;
  onRefresh?: () => void;
  onDataChange?: (data: { totalFound: number; isLoading: boolean; hasError: boolean }) => void;
}

const MemoizedListingCard = React.memo(ListingCard);
const MemoizedListingCardSkeleton = React.memo(ListingCardSkeleton);

export const SearchResultsList = React.memo(function SearchResultsList({
  searchParams,
  onRefresh,
  onDataChange
}: SearchResultsListProps) {
  const [canLoadMore, setCanLoadMore] = useState(false);
  
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
    error
  } = useSearchListings(searchParams);

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

  // Notify parent of data changes
  useEffect(() => {
    onDataChange?.({
      totalFound,
      isLoading,
      hasError: !!error
    });
  }, [totalFound, isLoading, error, onDataChange]);

  // Handle load more with proper throttling
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && canLoadMore) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, canLoadMore]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    onRefresh?.();
    refetch();
  }, [refetch, onRefresh]);

  // Render listing item
  const renderListingItem = useCallback(({ item }: { item: any }) => (
    <View paddingHorizontal="$2" paddingBottom="$3">
      <MemoizedListingCard listing={item} />
    </View>
  ), []);

  // Render loading skeleton
  const renderSkeletonItem = useCallback(({ index }: { index: number }) => (
    <View paddingHorizontal="$2" paddingBottom="$3" key={`skeleton-${index}`}>
      <MemoizedListingCardSkeleton />
    </View>
  ), []);

  // Key extractor
  const keyExtractor = useCallback((item: any) => item.id, []);

  // Render loading footer
  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View paddingVertical="$4" flexDirection="row" justifyContent="space-around">
        <View paddingHorizontal="$2" paddingBottom="$3">
          <MemoizedListingCardSkeleton />
        </View>
        <View paddingHorizontal="$2" paddingBottom="$3">
          <MemoizedListingCardSkeleton />
        </View>
      </View>
    );
  }, [isFetchingNextPage]);

  // Loading state - show skeleton grid
  if (isLoading) {
    const skeletonData = Array.from({ length: 6 }, (_, index) => ({ id: index }));
    
    return (
      <FlashList
        data={skeletonData}
        renderItem={renderSkeletonItem}
        estimatedItemSize={260}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: any) => `skeleton-${item.id}`}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        keyboardDismissMode="on-drag"
      />
    );
  }

  // Error state
  if (error) {
    return (
      <SearchEmptyState
        type="error"
        title="Search Error"
        message="Something went wrong while searching. Please try again."
        onRetry={handleRefresh}
      />
    );
  }

  // Empty state
  if (!flatListings || flatListings.length === 0) {
    const hasSearchQuery = searchParams.q && searchParams.q.trim().length > 0;
    const hasFilters = searchParams.filters && Object.values(searchParams.filters).some(filter => 
      Array.isArray(filter) ? filter.length > 0 : filter !== null
    );
    
    if (hasSearchQuery || hasFilters) {
      return (
        <SearchEmptyState
          type="no-results"
          title="No Results Found"
          message={
            hasSearchQuery 
              ? `No listings found for "${searchParams.q}"`
              : "No listings match your filters"
          }
          onClearFilters={() => onRefresh?.()}
        />
      );
    }

    return (
      <SearchEmptyState
        type="initial"
        title="Start Searching"
        message="Enter a search term or apply filters to find listings"
      />
    );
  }

  // Results list
  return (
    <View flex={1}>
      <FlashList
        data={flatListings}
        renderItem={renderListingItem}
        estimatedItemSize={260}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        keyExtractor={keyExtractor}
        drawDistance={500}
        removeClippedSubviews={true}
        getItemType={() => 'listing'}
        contentContainerStyle={{ paddingHorizontal: 0 }}
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
      />
    </View>
  );
});