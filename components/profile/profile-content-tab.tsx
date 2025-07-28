import { ListingCard } from '@/components/listing/listing-card';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'tamagui';
import type { ProfileContentTabProps } from '../../types/profile-content-tab.types';
import {
  getCurrentSortLabel,
  getSortOptions,
  isListingData,
  isReviewData,
  listingKeyExtractor,
  reviewKeyExtractor
} from '../../utils/profile-content-tab.utils';
import { SelectBottomSheet } from '../forms/select-bottom-sheet';
import { ProfileContentEmpty } from './profile-content-empty';
import { ProfileContentFooter } from './profile-content-footer';
import { ProfileContentHeader } from './profile-content-header';
import { ProfileContentLoading } from './profile-content-loading';

// Memoized components to prevent re-renders
const MemoizedListingCard = React.memo(ListingCard);

export const ProfileContentTab = React.memo(function ProfileContentTab({ 
  contentType, 
  data = [], 
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  onLoadMore,
  onSortChange,
  currentSort = 'newest'
}: ProfileContentTabProps) {
  const selectBottomSheetRef = useRef<BottomSheetModalMethods>(null);
  const [canLoadMore, setCanLoadMore] = useState(false);
  
  const isListingType = useMemo(() => 
    ['active', 'featured', 'sold'].includes(contentType), [contentType]
  );

  // Enable load more after initial render and when we have sufficient data
  useEffect(() => {
    const timer = setTimeout(() => {
      if (data.length > 0) {
        setCanLoadMore(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [data.length]);

  // Get sort options and current label
  const sortOptions = useMemo(() => getSortOptions(contentType), [contentType]);
  const currentSortLabel = useMemo(() => 
    getCurrentSortLabel(sortOptions, currentSort), [sortOptions, currentSort]
  );

  // Handle sort selection
  const handleSortSelect = useCallback((sortValue: string) => {
    const selectedOption = sortOptions.find(option => option.value === sortValue);
    if (selectedOption && onSortChange) {
      onSortChange(selectedOption.sortParams);
    }
  }, [sortOptions, onSortChange]);

  // Handle sort bottom sheet
  const handleSortPress = useCallback(() => {
    selectBottomSheetRef.current?.present();
  }, []);

  // Handle load more with proper throttling
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && onLoadMore && canLoadMore) {
      onLoadMore();
    }
  }, [hasNextPage, isFetchingNextPage, onLoadMore, canLoadMore]);

  // Render functions for different item types
  const renderListingItem = useCallback(({ item }: { item: any }) => (
    <View paddingHorizontal="$2" paddingBottom="$3">
      <MemoizedListingCard listing={item} />
    </View>
  ), []);

  const renderReviewItem = useCallback(({ item }: { item: any }) => (
    <View paddingHorizontal="$4" paddingVertical="$3">
      <View backgroundColor="$background" borderRadius="$4" padding="$4" gap="$3">
        <View flexDirection="row" alignItems="center" justifyContent="space-between">
          <Text fontWeight="600" fontSize="$5" color="$foreground">
            {item.reviewer_name || 'Anonymous'}
          </Text>
          <Text fontSize="$4" color="$mutedForeground">
            {item.rating ? `⭐ ${item.rating}/5` : ''}
          </Text>
        </View>
        {item.content && (
          <Text fontSize="$4" color="$foreground" lineHeight="$5">
            {item.content}
          </Text>
        )}
        {item.created_at && (
          <Text fontSize="$3" color="$mutedForeground">
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        )}
      </View>
    </View>
  ), []);

  // Loading state
  if (isLoading) {
    return <ProfileContentLoading contentType={contentType} />;
  }

  // Empty state
  if (!data || data.length === 0) {
    return <ProfileContentEmpty contentType={contentType} />;
  }

  // Content state for listings
  if (isListingType && isListingData(data, contentType)) {
    return (
      <View flex={1} gap="$2">
        <ProfileContentHeader
          contentType={contentType}
          dataLength={data.length}
          currentSortLabel={currentSortLabel}
          onSortPress={handleSortPress}
          showSort={!!onSortChange}
        />
        <FlashList
          data={data}
          renderItem={renderListingItem}
          estimatedItemSize={260}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyExtractor={listingKeyExtractor}
          drawDistance={500}
          removeClippedSubviews={true}
          getItemType={() => 'listing'}
          contentContainerStyle={{ paddingHorizontal: 0 }}
          ListFooterComponent={
            <ProfileContentFooter
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              onLoadMore={handleLoadMore}
            />
          }
        />
        {onSortChange && (
          <SelectBottomSheet
            ref={selectBottomSheetRef}
            options={sortOptions.map(option => ({ 
              label: option.label, 
              value: option.value 
            }))}
            onSelect={handleSortSelect}
            title="Sort Listings"
            subtitle="Choose how to sort the listings"
          />
        )}
      </View>
    );
  }

  // Content state for reviews
  if (contentType === 'reviews' && isReviewData(data, contentType)) {
    return (
      <View flex={1} gap="$2">
        <ProfileContentHeader
          contentType={contentType}
          dataLength={data.length}
          currentSortLabel={currentSortLabel}
          onSortPress={handleSortPress}
          showSort={!!onSortChange}
        />
        <FlashList
          data={data}
          renderItem={renderReviewItem}
          estimatedItemSize={120}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          keyExtractor={reviewKeyExtractor}
          drawDistance={300}
          removeClippedSubviews={true}
          getItemType={() => 'review'}
          contentContainerStyle={{ paddingTop: 16 }}
          ListFooterComponent={
            <ProfileContentFooter
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              onLoadMore={handleLoadMore}
            />
          }
        />
        {onSortChange && (
          <SelectBottomSheet
            ref={selectBottomSheetRef}
            options={sortOptions.map(option => ({ 
              label: option.label, 
              value: option.value 
            }))}
            onSelect={handleSortSelect}
            title="Sort Reviews"
            subtitle="Choose how to sort the reviews"
          />
        )}
      </View>
    );
  }

  // Fallback empty state
  return <ProfileContentEmpty contentType={contentType} />;
});