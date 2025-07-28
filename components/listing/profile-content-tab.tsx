import { ListingCard } from '@/components/listing/listing-card';
import { ListingCardSkeleton } from '@/components/suspense/listing-card-skeleton';
import type { ListingCard as ListingCardType } from '@bid-scents/shared-sdk';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useMemo } from 'react';
import { Text, View, XStack, useTheme } from 'tamagui';

type ContentType = 'active' | 'featured' | 'sold' | 'reviews';

interface Review {
  id?: string;
  reviewer_name?: string;
  rating?: number;
  content?: string;
  comment?: string;
  created_at?: string;
  review_id?: string;
}

interface ProfileContentTabProps {
  contentType: ContentType;
  data?: ListingCardType[] | Review[];
  isLoading?: boolean;
}

const EMPTY_STATES: Record<ContentType, { title: string; description: string }> = {
  active: {
    title: 'No Active Listings',
    description: "This user doesn't have any active listings yet."
  },
  featured: {
    title: 'No Featured Listings', 
    description: "This user doesn't have any featured listings."
  },
  sold: {
    title: 'No Sold Listings',
    description: "This user hasn't sold any items yet."
  },
  reviews: {
    title: 'No Reviews Yet',
    description: "This user hasn't received any reviews yet."
  }
};

// Type guard functions
function isListingData(data: ListingCardType[] | Review[], contentType: ContentType): data is ListingCardType[] {
  return ['active', 'featured', 'sold'].includes(contentType);
}

function isReviewData(data: ListingCardType[] | Review[], contentType: ContentType): data is Review[] {
  return contentType === 'reviews';
}

// Memoized components to prevent re-renders
const MemoizedListingCard = React.memo(ListingCard);

export const ProfileContentTab = React.memo(function ProfileContentTab({ 
  contentType, 
  data = [], 
  isLoading = false 
}: ProfileContentTabProps) {
  const theme = useTheme();
  const isListingType = useMemo(() => 
    ['active', 'featured', 'sold'].includes(contentType), [contentType]
  );

  // Memoized render functions
  const renderListingItem = useCallback(({ item }: { item: ListingCardType }) => (
    <View paddingHorizontal="$2" paddingBottom="$3">
      <MemoizedListingCard listing={item} />
    </View>
  ), []);

  const renderReviewItem = useCallback(({ item }: { item: Review }) => (
    <View paddingHorizontal="$4" paddingBottom="$3">
      <View padding="$3" backgroundColor="$gray2" borderRadius="$4">
        <Text fontSize="$4" fontWeight="600" color="$foreground">
          {item.reviewer_name || 'Anonymous'}
        </Text>
        <Text fontSize="$3" color="$mutedForeground" marginTop="$1">
          {item.rating || 5}/5 ⭐ • {new Date(item.created_at || Date.now()).toLocaleDateString()}
        </Text>
        <Text fontSize="$4" color="$foreground" marginTop="$2">
          {item.content || item.comment || 'Great experience!'}
        </Text>
      </View>
    </View>
  ), []);

  const renderListingSkeleton = useCallback(({ index }: { index: number }) => (
    <View key={index} paddingHorizontal="$2" paddingBottom="$3">
      <ListingCardSkeleton height={240} />
    </View>
  ), []);

  const renderReviewSkeleton = useCallback(({ index }: { index: number }) => (
    <View key={index} paddingHorizontal="$4" paddingBottom="$3">
      <View padding="$3" backgroundColor="$gray2" borderRadius="$4" height={100} />
    </View>
  ), []);

  // Memoized key extractors
  const listingKeyExtractor = useCallback((item: ListingCardType, index: number) => 
    `${item.id}-${index}`, []
  );

  const reviewKeyExtractor = useCallback((item: Review) => 
    item.id || item.review_id || Math.random().toString(), []
  );

  // Memoized skeleton data
  const skeletonData = useMemo(() => {
    const count = isListingType ? 6 : 3;
    return Array.from({ length: count });
  }, [isListingType]);

  // Memoized empty state
  const emptyState = useMemo(() => EMPTY_STATES[contentType], [contentType]);

  // Loading state
  if (isLoading) {
    const estimatedSize = isListingType ? 260 : 120;
    
    if (isListingType) {
      return (
        <View flex={1}>
          <FlashList
            data={skeletonData}
            renderItem={renderListingSkeleton}
            estimatedItemSize={estimatedSize}
            keyExtractor={(item, index) => `${index}`}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16 }}
          />
        </View>
      );
    } else {
      return (
        <View flex={1}>
          <FlashList
            data={skeletonData}
            renderItem={renderReviewSkeleton}
            estimatedItemSize={estimatedSize}
            keyExtractor={(item, index) => `${index}`}
            numColumns={1}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16 }}
          />
        </View>
      );
    }
  }

  // Empty state
  if (data.length === 0) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" paddingHorizontal="$4" minHeight={300}>
        <Text fontSize="$6" fontWeight="600" color="$mutedForeground" textAlign="center">
          {emptyState.title}
        </Text>
        <Text fontSize="$4" color="$mutedForeground" textAlign="center" marginTop="$2">
          {emptyState.description}
        </Text>
      </View>
    );
  }

  // Content state for listings
  if (isListingType && isListingData(data, contentType)) {
    return (
      <View flex={1} gap="$2">
        <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$4">
          <Text fontSize="$4" fontWeight="500" color="$mutedForeground">
            {data.length} Results
          </Text>
          <XStack alignItems="center" justifyContent="center" onPress={() => {}} hitSlop={16}>
            <Text fontSize="$4" fontWeight="500" color="$mutedForeground" >
              Sort
            </Text>
            <Ionicons name="chevron-down" size={16} color={theme.mutedForeground?.val} />
          </XStack>
        </XStack>
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
        />
      </View>
    );
  }

  // Content state for reviews
  if (contentType === 'reviews' && isReviewData(data, contentType)) {
    return (
      <View flex={1}>
        <XStack>
          <Text fontSize="$6" fontWeight="600" color="$foreground">
            {data.length}+ Reviews
          </Text>
        </XStack>
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
        />
      </View>
    );
  }

  // Fallback empty state
  return (
    <View flex={1} justifyContent="center" alignItems="center" paddingHorizontal="$4" minHeight={400}>
      <Text fontSize="$6" fontWeight="600" color="$mutedForeground" textAlign="center">
        No Content Available
      </Text>
    </View>
  );
});