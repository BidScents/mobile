import { ListingCard } from '@/components/listing/listing-card'
import { ListingCardSkeleton } from '@/components/suspense/listing-card-skeleton'
import { Container } from '@/components/ui/container'
import { useHomepage } from '@/hooks/queries/use-homepage'
import type { ListingCard as ListingCardType } from '@bid-scents/shared-sdk'
import { FlashList } from '@shopify/flash-list'
import React, { useMemo } from 'react'
import { ScrollView, Text, XStack, YStack } from 'tamagui'

/**
 * Feed item types for FlashList optimization
 * Each type has specific height calculations for better performance
 */
type FeedItem = 
  | { type: 'header'; title: string; showViewAll?: boolean }
  | { type: 'featured_grid'; listings: ListingCardType[] }
  | { type: 'horizontal_section'; title: string; listings: ListingCardType[] }
  | { type: 'spacer'; height: number }

/**
 * Homepage component using FlashList for optimal scrolling performance
 * Displays featured listings, auctions, and other content sections
 */
export default function Homepage() {
  const { data: homepage, isLoading, refetch, isFetching } = useHomepage()

  /**
   * Builds optimized feed data structure for FlashList
   * Alternates between featured grids and horizontal sections
   */
  const feedData = useMemo((): FeedItem[] => {
    const items: FeedItem[] = []

    if (isLoading) {
      // Loading state with proper skeleton structure
      return [
        { type: 'header', title: 'Featured', showViewAll: true },
        { type: 'featured_grid', listings: Array(6).fill({}) as ListingCardType[] },
        { type: 'spacer', height: 20 },
        { type: 'header', title: 'Active Auctions', showViewAll: true },
        { type: 'horizontal_section', title: 'Active Auctions', listings: Array(5).fill({}) as ListingCardType[] },
        { type: 'spacer', height: 20 },
        { type: 'header', title: 'Recent Listings', showViewAll: true },
        { type: 'horizontal_section', title: 'Recent Listings', listings: Array(5).fill({}) as ListingCardType[] },
        { type: 'spacer', height: 40 }
      ]
    }

    // Featured section
    if (homepage?.featured?.length) {
      items.push(
        { type: 'header', title: 'Featured', showViewAll: true },
        { type: 'featured_grid', listings: homepage.featured.slice(0, 6) }
      )
    }

    // Dynamic sections with data
    const sections = [
      { title: 'Active Auctions', data: homepage?.recent_auctions },
      { title: 'Recent Listings', data: homepage?.recent_listings },
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

    items.push({ type: 'spacer', height: 40 })
    return items
  }, [homepage, isLoading])

  const renderFeedItem = ({ item }: { item: FeedItem }) => {
    switch (item.type) {
      case 'header':
        return (
          <XStack paddingHorizontal="$4" paddingVertical="$2" justifyContent="space-between" alignItems="center">
            <Text fontSize="$8" fontWeight="600" color="$foreground">{item.title}</Text>
            {item.showViewAll && (
              <Text fontSize="$3" color="$mutedForeground">View all</Text>
            )}
          </XStack>
        )

      case 'featured_grid':
        return <FeaturedGridSection listings={item.listings} isLoading={isLoading} />

      case 'horizontal_section':
        return <HorizontalListSection listings={item.listings} isLoading={isLoading} />

      case 'spacer':
        return <YStack height={item.height} />

      default:
        return null
    }
  }

  return (
    <Container
      variant="fullscreen"
      safeArea={["bottom"]}
      backgroundColor="$background"
    >
      <FlashList
        data={feedData}
        renderItem={renderFeedItem}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        getItemType={(item) => item.type}
        estimatedItemSize={200}
        showsVerticalScrollIndicator={false}
        refreshing={isFetching && !isLoading}
        onRefresh={refetch}
      />
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
    <YStack gap="$3" paddingHorizontal="$4">
      {rows.map((row, rowIndex) => (
        <XStack key={rowIndex} gap="$3" justifyContent="space-between">
          {row.map((listing, itemIndex) => (
            <YStack key={isLoading ? `skeleton-${rowIndex}-${itemIndex}` : listing.id} flex={1}>
              {isLoading ? (
                <ListingCardSkeleton width={170} height={240} />
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
      <XStack gap="$3" paddingHorizontal="$4">
        {listings.map((listing, index) => (
          <YStack key={isLoading ? `skeleton-${index}` : listing.id} width={200}>
            {isLoading ? (
              <ListingCardSkeleton width={170} height={240} />
            ) : (
              <ListingCard listing={listing} />
            )}
          </YStack>
        ))}
      </XStack>
    </ScrollView>
  )
}

