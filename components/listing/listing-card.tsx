import { ListingCard as ListingCardType, ListingType } from '@bid-scents/shared-sdk'
import { router } from 'expo-router'
import React from 'react'
import { GestureResponderEvent } from 'react-native'
import { Card, Image, Text, XStack, YStack } from 'tamagui'
import { Button } from '../ui/button'
import { CountdownTimer } from './countdown-timer'
import { FavoriteButton } from './favorite-button'

interface ListingCardProps {
  listing: ListingCardType
  onPress?: () => void
  onFavorite?: (listingId: string) => Promise<void>
  onUnfavorite?: (listingId: string) => Promise<void>
}

/**
 * Unified vertical listing card component that adapts content based on listing type.
 * Supports FIXED_PRICE, NEGOTIABLE, AUCTION, and SWAP listings with consistent sizing.
 */
export function ListingCard({ listing, onPress, onFavorite, onUnfavorite }: ListingCardProps) {
  const handleCardPress = () => {
    onPress?.()
    router.push(`/listing/${listing.id}` as any)
  }

  const handleActionPress = (e: GestureResponderEvent) => {
    e.stopPropagation() // Prevent card navigation
    
    switch (listing.listing_type) {
      case ListingType.FIXED_PRICE:
      case ListingType.NEGOTIABLE:
        router.push(`/chat/${listing.seller.id}` as any)
        break
      case ListingType.AUCTION:
        router.push(`/listing/${listing.id}?action=bid` as any)
        break
      case ListingType.SWAP:
        router.push(`/chat/${listing.seller.id}?type=swap&listing=${listing.id}` as any)
        break
    }
  }

  const handleFavorite = async (listingId: string) => {
    await onFavorite?.(listingId)
  }

  const handleUnfavorite = async (listingId: string) => {
    await onUnfavorite?.(listingId)
  }

  const formatPrice = (price: number): string => {
    return `RM ${price.toFixed(0)}`
  }

  const formatCurrentBid = (bid: number): string => {
    return `RM ${bid.toFixed(0)}`
  }

  const formatVolume = (volume: number, percentage: number): string => {
    return `${percentage}% full • ${volume}ml`
  }

  const formatNextBid = (currentBid: number): string => {
    {/* TODO: use listing bid increment */}
    return `RM ${(currentBid + 0.5).toFixed(1)}`
  }

  const truncateDescription = (text: string, maxLength: number = 50): string => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  const renderHeader = () => {
    switch (listing.listing_type) {
      case ListingType.FIXED_PRICE:
        return (
            <XStack position="absolute" top="$2" left="$2" backgroundColor="$muted" alignItems="center" borderRadius="$5" paddingHorizontal="$2" paddingVertical="$2">
                <Text fontSize="$2" fontWeight="500" color="$foreground">Fixed Price</Text>
            </XStack>
          )
      case ListingType.NEGOTIABLE:
        return (
            <XStack position="absolute" top="$2" left="$2" backgroundColor="$muted" alignItems="center" borderRadius="$5" paddingHorizontal="$2" paddingVertical="$2">
                <Text fontSize="$2" fontWeight="500" color="$foreground">Negotiable</Text>
            </XStack>
          )
      case ListingType.AUCTION:
        return (
          <XStack position="absolute" top="$2" left="$2" right="$2" justifyContent="space-between" alignItems="center">
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
        )
      
      case ListingType.SWAP:
        return (
            <XStack position="absolute" top="$2" left="$2" backgroundColor="$muted" alignItems="center" borderRadius="$5" paddingHorizontal="$2" paddingVertical="$2">
                <Text fontSize="$2" fontWeight="500" color="$foreground">Swap</Text>
            </XStack>
          )
      
      default:
        return (
            <XStack position="absolute" top="$2" left="$2" backgroundColor="$muted" alignItems="center" borderRadius="$5" paddingHorizontal="$2" paddingVertical="$2">
                <Text fontSize="$2" fontWeight="500" color="$foreground">Buy Now</Text>
            </XStack>
          )
    }
  }

  const renderPriceSection = () => {
    switch (listing.listing_type) {
      case ListingType.FIXED_PRICE:
      case ListingType.NEGOTIABLE:
        return (
          <Text fontSize="$3" fontWeight="500" color="$foreground">
            {formatPrice(listing.price)}
          </Text>
        )
      
      case ListingType.AUCTION:
        return (
        <Text fontSize="$3" fontWeight="500" color="$foreground">
            Current bid: {formatCurrentBid(listing.current_bid || 0)}
        </Text> 
        )
      
      case ListingType.SWAP:
        return (
          <YStack gap="$1">
            {listing.description && (
              <Text fontSize="$3" color="$foreground" fontWeight="500" numberOfLines={1}>
                Swap: {truncateDescription(listing.description)}
              </Text>
            )}
          </YStack>
        )
      
      default:
        return (
          <Text fontSize="$3" fontWeight="500" color="$foreground">
            {formatPrice(listing.price)}
          </Text>
        )
    }
  }

  const renderActionButton = () => {
    switch (listing.listing_type) {
      case ListingType.FIXED_PRICE:
      case ListingType.NEGOTIABLE:
        return (
          <Button
            size="sm"
            variant="secondary"
            onPress={handleActionPress as any}
          >
            Contact Seller
          </Button>
        )
      
      case ListingType.AUCTION:
        return (
          <Button
            size="sm"
            variant="secondary"
            onPress={handleActionPress as any}
          >
            Bid {formatNextBid(listing.current_bid || 0)}
          </Button>
        )
      
      case ListingType.SWAP:
        return (
          <Button
            size="sm"
            variant="secondary"
            onPress={handleActionPress as any}
          >
            Swap
          </Button>
        )
      
      default:
        return (
          <Button
            size="sm"
            variant="secondary"
            onPress={handleActionPress as any}
          >
            Contact Seller
          </Button>
        )
    }
  }

  return (
    <Card
      size="$3"
      backgroundColor="$background"
      borderRadius="$6"
      padding="$2"
      pressStyle={{ scale: 0.99 }}
      onPress={handleCardPress}
      flex={1}
    >
      <YStack gap="$3">
        {/* Product Image */}
        <YStack position="relative">
          <Image
            source={{ uri: listing.image_url }}
            width="100%"
            aspectRatio={1}
            borderRadius="$5"
            backgroundColor="$gray2"
          />
          {renderHeader()}
          {/* Favorite Button - Bottom Right */}
          <XStack position="absolute" bottom="$2" right="$2">
            <FavoriteButton
              listingId={listing.id}
              initialCount={listing.favorites_count}
              onFavorite={handleFavorite}
              onUnfavorite={handleUnfavorite}
              size="small"
            />
          </XStack>
        </YStack>

        {/* Product Info */}
        <YStack flex={1} gap="$1.5" >
            <Text fontSize="$5" fontWeight="500" numberOfLines={1} color="$foreground">
                {listing.name}
            </Text>
            
            <Text fontSize="$4" color="$mutedForeground">
                {formatVolume(listing.volume, listing.remaining_percentage)}
            </Text>
            
            {/* Dynamic price/bid/swap info section */}
            {renderPriceSection()}
        </YStack>

        {/* Dynamic Action Button */}
        {renderActionButton()}
      </YStack>
    </Card>
  )
}