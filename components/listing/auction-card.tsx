import { router } from 'expo-router'
import React from 'react'
import { Card, Image, Text, XStack, YStack } from 'tamagui'
import { CardProps } from '../../types/listing'
import { Button } from '../ui/button'
import { CountdownTimer } from './countdown-timer'
import { FavoriteButton } from './favorite-button'

/**
 * Horizontal layout card for auction listings.
 * Shows live countdown timer, current bid, and bid count.
 */
export function AuctionCard({ listing, onPress, onFavorite }: CardProps) {
  const handleCardPress = () => {
    onPress?.()
    router.push(`/listing/${listing.id}` as any)
  }

  const handleBidPress = (e: any) => {
    e.stopPropagation() // Prevent card navigation
    router.push(`/listing/${listing.id}?action=bid` as any)
  }

  const handleFavoriteToggle = (listingId: string, isFavorited: boolean) => {
    onFavorite?.(listingId, isFavorited)
  }

  const formatBid = (bid: number): string => {
    return `RM ${bid.toFixed(0)}`
  }

  const formatVolume = (volume: number, percentage: number): string => {
    return `${percentage}% full • ${volume}ml`
  }

  console.log(listing.current_bid)
  return (
    <Card
      elevate
      size="$3"
      backgroundColor="$background"
      borderRadius="$6"
      padding="$3"
      pressStyle={{ scale: 0.99 }}
      onPress={handleCardPress}
      minWidth={160}
      maxWidth={370}
    >
      <XStack gap="$4" justifyContent="space-between" >
        {/* Product Image */}
        <YStack position="relative">
          <Image
            source={{ uri: listing.image_url }}
            width={160}
            height={160}
            borderRadius="$4"
            backgroundColor="$gray2"
          />
          
          {/* Favorite Button - Bottom Right of Image */}
          <XStack position="absolute" bottom="$2" right="$2">
            <FavoriteButton
              listingId={listing.id}
              initialCount={listing.favorites_count}
              onToggle={handleFavoriteToggle}
              size="small"
            />
          </XStack>
        </YStack>

        {/* Product Info */}
        <YStack width={"50%"} justifyContent='space-between' >

            {/* Auction Info */}
            <YStack  gap="$1.5" width={"100%"} >
                <XStack justifyContent="space-between" alignItems="center">
                    {listing.ends_at && (
                        <CountdownTimer 
                        endTime={listing.ends_at} 
                        size="small"
                        />
                    )}
                    <XStack backgroundColor="$muted" alignItems="center" borderRadius="$5" paddingHorizontal="$2" paddingVertical="$2">
                        <Text fontSize="$2" fontWeight="500" color="$foreground">
                        {listing.bid_count || 0} bid{listing.bid_count === 1 ? '' : 's'}
                        </Text>
                    </XStack>
                </XStack>

                <Text fontSize="$5" fontWeight="600" numberOfLines={1}>
                    {listing.name}
                </Text>
                
                <Text fontSize="$4" color="$mutedForeground">
                    {/* TODO add volume from backend */}
                    {/* {formatVolume(listing.volume, listing.remaining_percentage)} */}
                    {formatVolume(50, listing.remaining_percentage)}
                </Text>

                <Text fontSize="$4" color="$mutedForeground" >
                    Current bid: {formatBid(listing.current_bid || 0)}
                </Text>
            </YStack>


          {/* Bid Button */}
          <Button
            size="sm"
            variant="secondary"
            onPress={handleBidPress as any}
          >
            Bid RM {((listing.current_bid || 0) + 0.5).toFixed(1)}
          </Button>
        </YStack>
      </XStack>
    </Card>
  )
}