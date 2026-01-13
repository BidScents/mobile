import { NotificationsBottomSheet, NotificationsBottomSheetMethods } from '@/components/forms/notifications-bottom-sheet'
import { ListingCard } from '@/components/listing/listing-card'
import { ListingCardSkeleton } from '@/components/suspense/listing-card-skeleton'
import { Container } from '@/components/ui/container'
import { SearchBar } from '@/components/ui/search-bar'
import { useHomepage } from '@/hooks/queries/use-homepage'
import { useSearchListings } from '@/hooks/queries/use-listing'
import { createEmptyFilters } from '@/utils/search.utils'
import type { ListingCard as ListingCardType } from '@bid-scents/shared-sdk'
import { ListingType, useAuthStore } from '@bid-scents/shared-sdk'
import { LegendList } from "@legendapp/list"
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import * as Haptics from 'expo-haptics'
import * as Notifications from 'expo-notifications'
import { router } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { Dimensions } from 'react-native'
import { ScrollView, Text, XStack, YStack } from 'tamagui'

const screenWidth = Dimensions.get('window').width
const cardWidth = (screenWidth - 32 - 12) / 2; // 32 for padding, 12 for gap
const cardHeight = cardWidth * 1.4; // Maintain aspect ratio

/**
 * Feed item types for LegendList optimization
 * Each type has specific height calculations for better performance
 */
type FeedItem = 
  | { type: 'header'; title: string; showViewAll?: boolean }
  | { type: 'featured_grid'; listings: ListingCardType[] }
  | { type: 'horizontal_section'; title: string; listings: ListingCardType[] }
  | { type: 'infinite_grid_row'; listings: ListingCardType[] }
  | { type: 'loading_footer' }
  | { type: 'spacer'; height: number }

/**
 * Homepage component using LegendList for optimal scrolling performance
 * Displays featured listings, auctions, and other content sections
 */
export default function Homepage() {
  const { data: homepage, isLoading, refetch: refetchHomepage } = useHomepage()
  
  // Infinite scroll setup
  const searchParams = useMemo(() => ({
    q: '*',
    filters: createEmptyFilters(),
    sort: { field: undefined, descending: true },
    per_page: 20
  }), []);

  const { 
    data: searchData, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    refetch: refetchSearch 
  } = useSearchListings(searchParams);

  const infiniteListings = useMemo(() => 
    searchData?.pages.flatMap(page => page.listings) || [], 
  [searchData]);

  const tabbarHeight = useBottomTabBarHeight();
  const {isAuthenticated} = useAuthStore();
  const notificationsBottomSheetRef = useRef<NotificationsBottomSheetMethods>(null)

  useEffect(() => {
    const checkPermissions = async () => {
      if (!isAuthenticated) return;

      const settings = await Notifications.getPermissionsAsync();
      
      // Only show if permission is undetermined (user hasn't been asked yet)
      if (settings.status === Notifications.PermissionStatus.UNDETERMINED) {
        setTimeout(() => {
          notificationsBottomSheetRef.current?.present()
        }, 2000)
      }
    };

    checkPermissions();
  }, [isAuthenticated]);

  const handleRefresh = useCallback(() => {
    refetchHomepage();
    refetchSearch();
  }, [refetchHomepage, refetchSearch]);

  const handleViewAll = useCallback((type: ListingType) => {
    // Placeholder for future implementation
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const params = new URLSearchParams();
    params.append('q', '*');
    
    const filter = {
      listing_types: [type],
      categories: null,
      min_price: null,
      max_price: null,
      min_purchase_year: null,
      max_purchase_year: null,
      box_conditions: null,
      seller_ids: null,
    };
    
    params.append('filters', JSON.stringify(filter));
    router.push(`/(tabs)/home/search-results?${params.toString()}` as any);
  }, []);

  const handleSellersYouFollowViewAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/home/sellers-you-follow' as any);
  }, []);

  /**
   * Builds optimized feed data structure for LegendList
   * Alternates between featured grids and horizontal sections
   */
  const feedData = useMemo((): FeedItem[] => {
    const items: FeedItem[] = []

    if (isLoading) {
      // Loading state with proper skeleton structure
      return [
        { type: 'header', title: 'Featured', showViewAll: false },
        { type: 'featured_grid', listings: Array(6).fill({}) as ListingCardType[] },
        { type: 'spacer', height: 20 },
        { type: 'header', title: 'Active Auctions', showViewAll: true },
        { type: 'horizontal_section', title: 'Active Auctions', listings: Array(5).fill({}) as ListingCardType[] },
        { type: 'spacer', height: 20 },
        { type: 'header', title: 'Recent New', showViewAll: true },
        { type: 'horizontal_section', title: 'Recent New', listings: Array(5).fill({}) as ListingCardType[] },
        { type: 'spacer', height: 40 },
        { type: 'header', title: 'Recent Decant', showViewAll: true },
        { type: 'horizontal_section', title: 'Recent Decant', listings: Array(5).fill({}) as ListingCardType[] },
        { type: 'spacer', height: 40 },
        { type: 'header', title: 'Recent Preowned', showViewAll: true },
        { type: 'horizontal_section', title: 'Recent Preowned', listings: Array(5).fill({}) as ListingCardType[] },
        { type: 'spacer', height: 40 }
      ]
    }

    // Featured section
    if (homepage?.featured?.length) {
      items.push(
        { type: 'header', title: 'Featured', showViewAll: false },
        { type: 'featured_grid', listings: homepage.featured.slice(0, 6) }
      )
    }

    // Dynamic sections with data
    const sections = [
      { title: 'Active Auctions', data: homepage?.recent_auctions },
      { title: 'New', data: homepage?.recent_new },
      { title: 'Recent Decant', data: homepage?.recent_decant },
      { title: 'Recent Preowned', data: homepage?.recent_preowned },
      { title: 'From Sellers You Follow', data: homepage?.sellers_you_follow },
      { title: 'Recent Swaps', data: homepage?.recent_swaps }
    ]

    let featuredIndex = 6
    sections.forEach(({ title, data }) => {
      if (data?.length) {
        items.push(
          { type: 'spacer', height: 20 },
          { type: 'header', title, showViewAll: true },
          { type: 'horizontal_section', title, listings: data }
        )
        
        // Add more featured items between sections
        const nextFeaturedChunk = homepage?.featured?.slice(featuredIndex, featuredIndex + 4)
        if (nextFeaturedChunk?.length) {
          items.push(
            { type: 'spacer', height: 20 },
            { type: 'featured_grid', listings: nextFeaturedChunk }
          )
          featuredIndex += 4
        }
      }
    })

    items.push({ type: 'spacer', height: 20 })

    // Infinite Scroll Section
    if (infiniteListings.length > 0) {
      items.push({ type: 'header', title: 'All Listings', showViewAll: false });
      
      for (let i = 0; i < infiniteListings.length; i += 2) {
        items.push({ 
          type: 'infinite_grid_row', 
          listings: infiniteListings.slice(i, i + 2) 
        });
      }
    }

    if (isFetchingNextPage) {
      items.push({ type: 'loading_footer' });
    } else {
       items.push({ type: 'spacer', height: 20 });
    }

    return items
  }, [homepage, isLoading, infiniteListings, isFetchingNextPage])

  const renderFeedItem = ({ item }: { item: FeedItem }) => {
    switch (item.type) {
      case 'header':
        const getViewAllHandler = () => {
          switch (item.title) {
            case 'Active Auctions':
              return () => handleViewAll(ListingType.AUCTION);
            case 'New':
              return () => handleViewAll(ListingType.NEW);
            case 'Recent Decant':
              return () => handleViewAll(ListingType.DECANT);
            case 'Recent Preowned':
              return () => handleViewAll(ListingType.PREOWNED);
            case 'Recent Swaps':
              return () => handleViewAll(ListingType.SWAP);
            case 'From Sellers You Follow':
              return handleSellersYouFollowViewAll;
            default:
              return undefined;
          }
        };

        return (
          <XStack paddingHorizontal="0" paddingVertical="$2" justifyContent="space-between" alignItems="center">
            <Text fontSize="$8" fontWeight="600" color="$foreground">{item.title}</Text>
            {item.showViewAll && (
              <Text 
                fontSize="$3" 
                color="$mutedForeground"
                onPress={getViewAllHandler()}
                pressStyle={{ opacity: 0.6 }}
                cursor="pointer"
              >
                View all
              </Text>
            )}
          </XStack>
        )

      case 'featured_grid':
        return <FeaturedGridSection listings={item.listings} isLoading={isLoading} />

      case 'horizontal_section':
        return <HorizontalListSection listings={item.listings} isLoading={isLoading} />

      case 'infinite_grid_row':
        return (
          <XStack gap="$3" justifyContent="space-between" mb="$3">
            {item.listings.map((listing) => (
              <YStack key={listing.id} flex={1}>
                <ListingCard listing={listing} />
              </YStack>
            ))}
            {item.listings.length === 1 && <YStack flex={1} />}
          </XStack>
        )

      case 'loading_footer':
        return (
          <XStack gap="$3" justifyContent="space-between" mb="$3">
              <ListingCardSkeleton width={cardWidth} height={cardHeight} />
              <ListingCardSkeleton width={cardWidth} height={cardHeight} />
          </XStack>
        )

      case 'spacer':
        return <YStack height={item.height} />

      default:
        return null
    }
  }

  return (
    <Container
      variant="padded"
      safeArea={false}
      backgroundColor="$background"
    >
      <XStack pb="$2" width="100%" >
        <SearchBar 
          placeholder="Search listings..." 
          navigateToResults={true}
          editable={true}
        />
      </XStack>
      <LegendList
        data={feedData}
        renderItem={renderFeedItem}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        estimatedItemSize={200}
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        keyboardDismissMode="on-drag"
        recycleItems
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.3}
        contentContainerStyle={{ paddingBottom: tabbarHeight }}
      />
      <NotificationsBottomSheet ref={notificationsBottomSheetRef} />
    </Container>
  )
}

/**
 * Featured grid section with 2-column layout
 * Displays skeleton loading state when data is loading
 */
function FeaturedGridSection({ listings, isLoading }: { listings: ListingCardType[]; isLoading: boolean }) {
  const rows = useMemo(() => {
    const result = []
    for (let i = 0; i < listings.length; i += 2) {
      result.push(listings.slice(i, i + 2))
    }
    return result
  }, [listings])

  return (
    <YStack gap="$3" paddingHorizontal="0">
      {rows.map((row, rowIndex) => (
        <XStack key={rowIndex} gap="$3" justifyContent="space-between">
          {row.map((listing, itemIndex) => (
            <YStack key={isLoading ? `skeleton-${rowIndex}-${itemIndex}` : listing.id} flex={1}>
              {isLoading ? (
                <ListingCardSkeleton width={cardWidth} height={cardHeight} />
              ) : (
                <ListingCard listing={listing} />
              )}
            </YStack>
          ))}
          {row.length === 1 && <YStack flex={1} />}
        </XStack>
      ))}
    </YStack>
  )
}


/**
 * Horizontal scrolling section for auction/listing cards
 * Shows skeleton loading state when data is loading
 */
function HorizontalListSection({ listings, isLoading }: { listings: ListingCardType[]; isLoading: boolean }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <XStack gap="$3" paddingHorizontal="0">
        {listings.map((listing, index) => (
          <YStack key={isLoading ? `skeleton-${index}` : listing.id} width={200}>
            {isLoading ? (
              <ListingCardSkeleton width={cardWidth} height={cardHeight} />
            ) : (
              <ListingCard listing={listing} />
            )}
          </YStack>
        ))}
      </XStack>
    </ScrollView>
  )
}

