import { ListingCard } from '@/components/listing/listing-card';
import { AvatarIcon } from '@/components/ui/avatar-icon';
import { ThemedIonicons } from '@/components/ui/themed-icons';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { LegendList } from '@legendapp/list';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View, XStack, YStack } from 'tamagui';
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    <View paddingHorizontal="$4">
      <YStack 
        backgroundColor="$muted" 
        borderRadius="$6" 
        padding="$4" 
        gap="$3"
      >
        <XStack alignItems="center" gap="$3">
          <XStack 
            alignItems="center" 
            gap="$3" 
            flex={1}
            onPress={() => {
              if (item.reviewer?.id) {
                router.push(`/profile/${item.reviewer.id}`);
              }
            }}
            hitSlop={10}
          >
            <AvatarIcon 
              url={item.reviewer?.profile_image_url} 
              size="$6" 
            />
            <YStack flex={1}>
              <Text fontWeight="600" fontSize="$5" color="$foreground">
                {item.reviewer?.username || 'Anonymous'}
              </Text>
              {item.reviewed_at && (
                <Text fontSize="$3" color="$mutedForeground">
                  {new Date(item.reviewed_at).toLocaleDateString()}
                </Text>
              )}
            </YStack>
          </XStack>
          
          {item.rating && (
            <XStack alignItems="center" gap="$1.5">
              <ThemedIonicons 
                name="star" 
                size={16} 
                themeColor="rating" 
              />
              <Text fontSize="$4" fontWeight="500" color="$foreground">
                {item.rating}/5
              </Text>
            </XStack>
          )}
        </XStack>
        
        {item.comment && (
          <Text fontSize="$4" color="$foreground" lineHeight="$5">
            {item.comment}
          </Text>
        )}
      </YStack>
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
        <LegendList
          data={data}
          renderItem={renderListingItem}
          estimatedItemSize={260}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyExtractor={listingKeyExtractor}
          drawDistance={500}
          recycleItems
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
        <LegendList
          data={data}
          renderItem={renderReviewItem}
          estimatedItemSize={120}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          keyExtractor={reviewKeyExtractor}
          drawDistance={300}
          recycleItems
          contentContainerStyle={{ paddingTop: 8, gap: 12 }}
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