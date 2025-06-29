import { router } from 'expo-router'
import React from 'react'
import { Card, Image, Text, XStack, YStack } from 'tamagui'
import { CardProps } from '../../types/listing'
import { Button } from '../ui/button'
import { FavoriteButton } from './favorite-button'

/**
 * Vertical layout card for fixed price and negotiable listings.
 * Displays product image, details, price, and action buttons.
 */
export function BuyNowCard({ listing, onPress, onFavorite }: CardProps) {
  const handleCardPress = () => {
    onPress?.()
    router.push(`/listing/${listing.id}` as any)
  }

  const handleContactSeller = (e: any) => {
    e.stopPropagation() // Prevent card navigation
    router.push(`/chat/${listing.seller.id}` as any)
  }

  const handleFavoriteToggle = (listingId: string, isFavorited: boolean) => {
    onFavorite?.(listingId, isFavorited)
  }

  const formatPrice = (price: number): string => {
    return `RM ${price.toFixed(0)}`
  }

  const formatVolume = (volume: number, percentage: number): string => {
    return `${percentage}% full • ${volume}ml`
  }

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
      maxWidth={180}
    >
      <YStack space="$3">
        {/* Product Image */}
        <YStack position="relative">
          <Image
            source={{ uri: listing.image_url }}
            width="100%"
            height={160}
            borderRadius="$5"
            backgroundColor="$gray2"
          />
          
          {/* Favorite Button - Bottom Right */}
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
        <YStack gap={'$1.5'}>
          <Text fontSize="$5" fontWeight="600" numberOfLines={2} color="$foreground">
            {listing.name}
          </Text>
          
          <Text fontSize="$4" color="$mutedForeground">
            {/* {formatVolume(listing.volume, listing.remaining_percentage)} */}{/* TODO add volume from backend */}
            {formatVolume(50, listing.remaining_percentage)}
          </Text>
          
          <Text fontSize="$4" fontWeight="600" color="$foreground">
            {formatPrice(listing.price)}
          </Text>
        </YStack>

        {/* Contact Seller Button */}
        <Button
          size="sm"
          variant="secondary"
          onPress={handleContactSeller as any}
        >
          Contact Seller
        </Button>
      </YStack>
    </Card>
  )
}