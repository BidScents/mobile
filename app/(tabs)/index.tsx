import { ListingCard } from '@/components/listing/listing-card'
import { ListingCardSkeleton } from '@/components/suspense/listing-card-skeleton'
import { useHomepage } from '@/hooks/queries/use-homepage'
import type { ListingCard as ListingCardType } from '@bid-scents/shared-sdk'
import { FlashList } from '@shopify/flash-list'
import React from 'react'
import { ScrollView, Text, XStack, YStack } from 'tamagui'

// Define item types for the feed
type FeedItem = 
  | { type: 'header'; title: string; showViewAll?: boolean }
  | { type: 'featured_grid'; listings: ListingCardType[]; chunkIndex: number }
  | { type: 'horizontal_section'; title: string; listings: ListingCardType[] }
  | { type: 'featured_skeleton_grid'; itemCount: number; chunkIndex: number }
  | { type: 'horizontal_skeleton' }
  | { type: 'spacer'; height: number }

export default function Homepage() {
  const { data: homepage, isLoading, error, refetch } = useHomepage()
  
  // For now, show skeletons to test UI
  const showSkeletons = false

  // Build the feed data structure
  const buildFeedData = (): FeedItem[] => {
    const feedItems: FeedItem[] = []

    if (showSkeletons) {
      // Build skeleton feed
      feedItems.push(
        { type: 'header', title: 'Featured', showViewAll: true },
        { type: 'featured_skeleton_grid', itemCount: 6, chunkIndex: 0 },
        { type: 'spacer', height: 20 },
        { type: 'header', title: 'Active Auctions', showViewAll: true },
        { type: 'horizontal_skeleton' },
        { type: 'spacer', height: 20 },
        { type: 'featured_skeleton_grid', itemCount: 2, chunkIndex: 1 },
        { type: 'spacer', height: 20 },
        { type: 'header', title: 'Recent Listings', showViewAll: true },
        { type: 'horizontal_skeleton' },
        { type: 'spacer', height: 20 },
        { type: 'featured_skeleton_grid', itemCount: 2, chunkIndex: 2 },
        { type: 'spacer', height: 20 },
        { type: 'header', title: 'From Sellers You Follow', showViewAll: true },
        { type: 'horizontal_skeleton' },
        { type: 'spacer', height: 20 },
        { type: 'featured_skeleton_grid', itemCount: 2, chunkIndex: 3 },
        { type: 'spacer', height: 20 },
        { type: 'header', title: 'Recent Swaps', showViewAll: true },
        { type: 'horizontal_skeleton' },
        { type: 'spacer', height: 20 },
        { type: 'featured_skeleton_grid', itemCount: 2, chunkIndex: 4 },
        { type: 'spacer', height: 40 } // Bottom padding
      )
    } else {
      // Build real data feed
      const featured = homepage?.featured || []
      const chunkSizes = [6, 4, 6, 8, 6]
      let currentIndex = 0

      feedItems.push({ type: 'header', title: 'Featured', showViewAll: true })

      // Add featured chunks with breaks
      chunkSizes.forEach((size, index) => {
        const chunk = featured.slice(currentIndex, currentIndex + size)
        if (chunk.length > 0) {
          feedItems.push({ type: 'featured_grid', listings: chunk, chunkIndex: index })
          currentIndex += size
        }

        // Add breaks between chunks
        if (index === 0 && (homepage?.recent_auctions?.length || 0) > 0) {
          feedItems.push(
            { type: 'spacer', height: 20 },
            { type: 'header', title: 'Active Auctions', showViewAll: true },
            { type: 'horizontal_section', title: 'Active Auctions', listings: homepage?.recent_auctions || [] }
          )
        } else if (index === 1 && (homepage?.recent_listings?.length || 0) > 0) {
          feedItems.push(
            { type: 'spacer', height: 20 },
            { type: 'header', title: 'Recent Listings', showViewAll: true },
            { type: 'horizontal_section', title: 'Recent Listings', listings: homepage?.recent_listings || [] }
          )
        } else if (index === 2 && (homepage?.sellers_you_follow?.length || 0) > 0) {
          feedItems.push(
            { type: 'spacer', height: 20 },
            { type: 'header', title: 'From Sellers You Follow', showViewAll: true },
            { type: 'horizontal_section', title: 'Sellers You Follow', listings: homepage?.sellers_you_follow || [] }
          )
        } else if (index === 3 && (homepage?.recent_swaps?.length || 0) > 0) {
          feedItems.push(
            { type: 'spacer', height: 20 },
            { type: 'header', title: 'Recent Swaps', showViewAll: true },
            { type: 'horizontal_section', title: 'Recent Swaps', listings: homepage?.recent_swaps || [] }
          )
        }

        if (index < chunkSizes.length - 1) {
          feedItems.push({ type: 'spacer', height: 20 })
        }
      })

      feedItems.push({ type: 'spacer', height: 40 }) // Bottom padding
    }

    return feedItems
  }

  const feedData = buildFeedData()

  const renderFeedItem = ({ item, index }: { item: FeedItem; index: number }) => {
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
        return <FeaturedGridSection listings={item.listings} />

      case 'featured_skeleton_grid':
        return <FeaturedSkeletonSection itemCount={item.itemCount} />

      case 'horizontal_section':
        return <HorizontalListSection listings={item.listings} />

      case 'horizontal_skeleton':
        return <HorizontalSkeletonSection />

      case 'spacer':
        return <YStack height={item.height} />

      default:
        return null
    }
  }

  const getItemType = (item: FeedItem) => {
    return item.type
  }

  const getItemHeight = (item: FeedItem) => {
    switch (item.type) {
      case 'header':
        return 60
      case 'featured_grid':
        const rows = Math.ceil(item.listings.length / 2)
        return rows * 260 // 240 + padding
      case 'featured_skeleton_grid':
        const skeletonRows = Math.ceil(item.itemCount / 2)
        return skeletonRows * 260
      case 'horizontal_section':
      case 'horizontal_skeleton':
        return 260 // 240 + padding
      case 'spacer':
        return item.height
      default:
        return 50
    }
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <FlashList
        data={feedData}
        renderItem={renderFeedItem}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        getItemType={getItemType}
        estimatedItemSize={200}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 12 }}
      />
    </YStack>
  )
}

// Featured Grid Section Component
function FeaturedGridSection({ listings }: { listings: ListingCardType[] }) {
  const rows = []
  
  for (let i = 0; i < listings.length; i += 2) {
    rows.push(listings.slice(i, i + 2))
  }

  return (
    <YStack gap="$3" paddingHorizontal="$4">
      {rows.map((row, rowIndex) => (
        <XStack key={rowIndex} gap="$3" justifyContent="space-between">
          {row.map((listing) => (
            <YStack key={listing.id} flex={1}>
              <ListingCard listing={listing} />
            </YStack>
          ))}
          {row.length === 1 && <YStack flex={1} />}
        </XStack>
      ))}
    </YStack>
  )
}

// Featured Skeleton Section Component
function FeaturedSkeletonSection({ itemCount }: { itemCount: number }) {
  const items = Array.from({ length: itemCount }, (_, i) => i)
  const rows = []
  
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2))
  }

  return (
    <YStack gap="$3" paddingHorizontal="$4">
      {rows.map((row, rowIndex) => (
        <XStack key={rowIndex} gap="$3" justifyContent="space-between">
          {row.map((item) => (
            <YStack key={item} flex={1}>
              <ListingCardSkeleton width={170} height={240} />
            </YStack>
          ))}
          {row.length === 1 && <YStack flex={1} />}
        </XStack>
      ))}
    </YStack>
  )
}

// Horizontal List Section Component
function HorizontalListSection({ listings }: { listings: ListingCardType[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <XStack gap="$3" paddingHorizontal="$4">
        {listings.map((listing) => (
          <YStack key={listing.id} width={200}>
            <ListingCard listing={listing} />
          </YStack>
        ))}
      </XStack>
    </ScrollView>
  )
}

// Horizontal Skeleton Section Component
function HorizontalSkeletonSection() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <XStack gap="$3" paddingHorizontal="$4">
        {Array.from({ length: 5 }, (_, i) => (
          <YStack key={i} width={200}>
            <ListingCardSkeleton width={170} height={240} />
          </YStack>
        ))}
      </XStack>
    </ScrollView>
  )
}

// import { ListingCard } from '@/components/listing/listing-card'
// import { ListingCardSkeleton } from '@/components/suspense/listing-card-skeleton'
// import { useHomepage } from '@/hooks/queries/use-homepage'
// import type { ListingCard as ListingCardType } from '@bid-scents/shared-sdk'
// import React from 'react'
// import { ScrollView, Text, XStack, YStack } from 'tamagui'

// export default function Homepage() {
//   const { data: homepage, isLoading, error, refetch } = useHomepage()
//   console.log(
//     homepage?.featured?.length,
//     homepage?.recent_auctions?.length,
//     homepage?.recent_listings?.length,
//     homepage?.sellers_you_follow?.length,
//     homepage?.recent_swaps?.length
//   )
  
//   // For now, show skeletons to test UI
//   const showSkeletons = false

//   return (
//     <ScrollView flex={1} backgroundColor="$background" showsVerticalScrollIndicator={false}>
//       <YStack gap="$4" paddingVertical="$3">
        
//         {/* Featured Listings - Part 1 WITH header */}
//         <YStack gap="$3">
//           <XStack paddingHorizontal="$4" justifyContent="space-between" alignItems="center">
//             <Text fontSize="$8" fontWeight="600" color="$foreground">Featured</Text>
//             <Text fontSize="$3" color="$mutedForeground">View all</Text>
//           </XStack>
          
//           {showSkeletons ? (
//             <FeaturedSkeletonGrid itemCount={6} />
//           ) : isLoading ? (
//             <FeaturedSkeletonGrid itemCount={6} />
//           ) : (homepage?.featured?.length || 0) > 0 ? (
//             <FeaturedGrid listings={homepage?.featured?.slice(0, 6) || []} />
//           ) : (
//             <YStack paddingHorizontal="$4" paddingVertical="$6" alignItems="center">
//               <Text color="$mutedForeground">No featured listings available</Text>
//             </YStack>
//           )}
//         </YStack>

//         {/* Recent Auctions - Horizontal Break */}
//         <YStack gap="$3">
//           <XStack paddingHorizontal="$4" justifyContent="space-between" alignItems="center">
//             <Text fontSize="$8" fontWeight="600" color="$foreground">Active Auctions</Text>
//             <Text fontSize="$3" color="$mutedForeground">View all</Text>
//           </XStack>
          
//           {showSkeletons ? (
//             <HorizontalSkeleton />
//           ) : isLoading ? (
//             <HorizontalSkeleton />
//           ) : (homepage?.recent_auctions?.length || 0) > 0 ? (
//             <HorizontalSection listings={homepage?.recent_auctions || []} />
//           ) : (
//             <YStack paddingHorizontal="$4" paddingVertical="$4" alignItems="center">
//               <Text color="$mutedForeground">No active auctions</Text>
//             </YStack>
//           )}
//         </YStack>

//         {/* Featured Listings - Part 2 (Continues) */}
//         {showSkeletons ? (
//           <FeaturedSkeletonGrid itemCount={4} />
//         ) : (homepage?.featured?.length || 0) > 6 ? (
//           <FeaturedGrid listings={homepage?.featured?.slice(6, 10) || []} />
//         ) : null}

//         {/* Recent Listings - Horizontal Break */}
//         <YStack gap="$3">
//           <XStack paddingHorizontal="$4" justifyContent="space-between" alignItems="center">
//             <Text fontSize="$8" fontWeight="600" color="$foreground">Recent Listings</Text>
//             <Text fontSize="$3" color="$mutedForeground">View all</Text>
//           </XStack>
          
//           {showSkeletons ? (
//             <HorizontalSkeleton />
//           ) : isLoading ? (
//             <HorizontalSkeleton />
//           ) : (homepage?.recent_listings?.length || 0) > 0 ? (
//             <HorizontalSection listings={homepage?.recent_listings || []} />
//           ) : (
//             <YStack paddingHorizontal="$4" paddingVertical="$4" alignItems="center">
//               <Text color="$mutedForeground">No recent listings</Text>
//             </YStack>
//           )}
//         </YStack>

//         {/* Featured Listings - Part 3 (Continues) */}
//         {showSkeletons ? (
//           <FeaturedSkeletonGrid itemCount={6} />
//         ) : (homepage?.featured?.length || 0) > 10 ? (
//           <FeaturedGrid listings={homepage?.featured?.slice(10, 16) || []} />
//         ) : null}

//         {/* Sellers You Follow - Horizontal Break */}
//         {(showSkeletons || (homepage?.sellers_you_follow?.length || 0) > 0) && (
//           <YStack gap="$3">
//             <XStack paddingHorizontal="$4" justifyContent="space-between" alignItems="center">
//               <Text fontSize="$8" fontWeight="600" color="$foreground">From Sellers You Follow</Text>
//               <Text fontSize="$3" color="$mutedForeground">View all</Text>
//             </XStack>
            
//             {showSkeletons ? (
//               <HorizontalSkeleton />
//             ) : (
//               <HorizontalSection listings={homepage?.sellers_you_follow || []} />
//             )}
//           </YStack>
//         )}

//         {/* Featured Listings - Part 4 (Continues) */}
//         {showSkeletons ? (
//           <FeaturedSkeletonGrid itemCount={4} />
//         ) : (homepage?.featured?.length || 0) > 16 ? (
//           <FeaturedGrid listings={homepage?.featured?.slice(16, 24) || []} />
//         ) : null}

//         {/* Recent Swaps - Horizontal Break */}
//         {(showSkeletons || (homepage?.recent_swaps?.length || 0) > 0) && (
//           <YStack gap="$3">
//             <XStack paddingHorizontal="$4" justifyContent="space-between" alignItems="center">
//               <Text fontSize="$8" fontWeight="600" color="$foreground">Recent Swaps</Text>
//               <Text fontSize="$3" color="$mutedForeground">View all</Text>
//             </XStack>
            
//             {showSkeletons ? (
//               <HorizontalSkeleton />
//             ) : (
//               <HorizontalSection listings={homepage?.recent_swaps || []} />
//             )}
//           </YStack>
//         )}

//         {/* Featured Listings - Final Part */}
//         {showSkeletons ? (
//           <FeaturedSkeletonGrid itemCount={4} />
//         ) : (homepage?.featured?.length || 0) > 24 ? (
//           <FeaturedGrid listings={homepage?.featured?.slice(24) || []} />
//         ) : null}

//         {/* Bottom Padding for tab bar */}
//         <YStack height="$8" />
//       </YStack>
//     </ScrollView>
//   )
// }

// // Simple grid skeleton - Updated height to 240
// function FeaturedSkeletonGrid({ itemCount = 6 }: { itemCount?: number }) {
//   const items = Array.from({ length: itemCount }, (_, i) => i)
//   const rows = []
  
//   for (let i = 0; i < items.length; i += 2) {
//     rows.push(items.slice(i, i + 2))
//   }

//   return (
//     <YStack gap="$3" paddingHorizontal="$4">
//       {rows.map((row, rowIndex) => (
//         <XStack key={rowIndex} gap="$3" justifyContent="space-between">
//           {row.map((item) => (
//             <YStack key={item} flex={1}>
//               <ListingCardSkeleton width={170} height={240} />
//             </YStack>
//           ))}
//           {row.length === 1 && <YStack flex={1} />}
//         </XStack>
//       ))}
//     </YStack>
//   )
// }

// // Featured Grid Component for real data
// function FeaturedGrid({ listings }: { listings: ListingCardType[] }) {
//   const rows = []
  
//   for (let i = 0; i < listings.length; i += 2) {
//     rows.push(listings.slice(i, i + 2))
//   }

//   return (
//     <YStack gap="$3" paddingHorizontal="$4">
//       {rows.map((row, rowIndex) => (
//         <XStack key={rowIndex} gap="$3" justifyContent="space-between">
//           {row.map((listing) => (
//             <YStack key={listing.id} flex={1}>
//               <ListingCard listing={listing} />
//             </YStack>
//           ))}
//           {row.length === 1 && <YStack flex={1} />}
//         </XStack>
//       ))}
//     </YStack>
//   )
// }

// // Horizontal Section Component for real data
// function HorizontalSection({ listings }: { listings: ListingCardType[] }) {
//   return (
//     <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//       <XStack gap="$3" paddingHorizontal="$4">
//         {listings.map((listing) => (
//           <YStack key={listing.id} width={200}>
//             <ListingCard listing={listing} />
//           </YStack>
//         ))}
//       </XStack>
//     </ScrollView>
//   )
// }

// // Horizontal Skeleton - Updated height to 240
// function HorizontalSkeleton() {
//   return (
//     <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//       <XStack gap="$3" paddingHorizontal="$4">
//         <ListingCardSkeleton width={170} height={240} />
//         <ListingCardSkeleton width={170} height={240} />
//         <ListingCardSkeleton width={170} height={240} />
//         <ListingCardSkeleton width={170} height={240} />
//         <ListingCardSkeleton width={170} height={240} />
//       </XStack>
//     </ScrollView>
//   )
// }