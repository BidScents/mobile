import { ListingCardSkeleton } from '@/components/suspense/listing-card-skeleton';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useMemo } from 'react';
import { View } from 'tamagui';
import type { ContentType } from '../../types/profile-content-tab.types';

interface ProfileContentLoadingProps {
  contentType: ContentType;
}

export const ProfileContentLoading = React.memo(function ProfileContentLoading({ 
  contentType 
}: ProfileContentLoadingProps) {
  const isListingType = useMemo(() => 
    ['active', 'featured', 'sold'].includes(contentType), [contentType]
  );

  const renderListingSkeleton = useCallback(({ index }: { index: number }) => (
    <View key={index} paddingHorizontal="$2" paddingBottom="$3">
      <ListingCardSkeleton height={240} />
    </View>
  ), []);

  const renderReviewSkeleton = useCallback(({ index }: { index: number }) => (
    <View key={index} paddingHorizontal="$4" paddingVertical="$3">
      <View backgroundColor="$background" borderRadius="$4" padding="$4" gap="$3">
        <View height={16} backgroundColor="$muted" borderRadius="$2" width="40%" />
        <View height={12} backgroundColor="$muted" borderRadius="$2" width="60%" />
        <View height={12} backgroundColor="$muted" borderRadius="$2" width="80%" />
        <View height={12} backgroundColor="$muted" borderRadius="$2" width="30%" />
      </View>
    </View>
  ), []);

  const skeletonData = useMemo(() => {
    const count = isListingType ? 6 : 3;
    return Array.from({ length: count });
  }, [isListingType]);

  const estimatedSize = isListingType ? 260 : 120;

  if (isListingType) {
    return (
      <View flex={1}>
        <FlashList
          data={skeletonData}
          renderItem={renderListingSkeleton}
          estimatedItemSize={estimatedSize}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyExtractor={(_, index) => `skeleton-${index}`}
          contentContainerStyle={{ paddingHorizontal: 0 }}
        />
      </View>
    );
  }

  return (
    <View flex={1}>
      <FlashList
        data={skeletonData}
        renderItem={renderReviewSkeleton}
        estimatedItemSize={estimatedSize}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        keyExtractor={(_, index) => `skeleton-${index}`}
        contentContainerStyle={{ paddingTop: 16 }}
      />
    </View>
  );
});
