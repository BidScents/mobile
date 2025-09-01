import { currency } from "@/constants/constants";
import {
  ListingCard as ListingCardType,
  ListingType,
} from "@bid-scents/shared-sdk";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { GestureResponderEvent } from "react-native";
import { Card, Image, Text, XStack, YStack } from "tamagui";
import { queryKeys } from "../../hooks/queries/query-keys";
import { seedListingDetailCache } from "../../hooks/queries/use-listing";
import { Button } from "../ui/button";
import { CountdownTimer } from "./countdown-timer";
import { FavoriteButton } from "./favorite-button";

interface ListingCardProps {
  listing: ListingCardType;
  onPress?: () => void;
}

/**
 * Unified vertical listing card component that adapts content based on listing type.
 * Supports FIXED_PRICE, NEGOTIABLE, AUCTION, and SWAP listings with consistent sizing.
 */
export function ListingCard({
  listing,
  onPress,
}: ListingCardProps) {
  const queryClient = useQueryClient();
  const isPressed = React.useRef(false);

  const handleCardPress = () => {
    if (isPressed.current) {
      return;
    }
    isPressed.current = true;
    setTimeout(() => {
      isPressed.current = false;
    }, 1000); // Prevent double-tap
    onPress?.();
    
    // Only seed cache if no data exists or existing data is also seeded
    const existingData = queryClient.getQueryData(
      queryKeys.listings.detail(listing.id)
    ) as any;
    
    if (!existingData || existingData?.__seeded === true) {
      // Seed cache with listing card data for instant loading
      seedListingDetailCache(queryClient, listing);
    }
    
    router.push(`/listing/${listing.id}` as any);
  };

  const handleActionPress = (e: GestureResponderEvent) => {
    e.stopPropagation(); // Prevent card navigation

    switch (listing.listing_type) {
      case ListingType.FIXED_PRICE:
      case ListingType.NEGOTIABLE:
        router.push(`/chat/${listing.seller.id}` as any);
        break;
      case ListingType.AUCTION:
        router.push(`/listing/${listing.id}?action=bid` as any);
        break;
      case ListingType.SWAP:
        router.push(
          `/chat/${listing.seller.id}?type=swap&listing=${listing.id}` as any
        );
        break;
    }
  };

  const formatPrice = (price: number): string => {
    return `${currency} ${price.toFixed(0)}`;
  };

  const formatCurrentBid = (bid: number): string => {
    return `${currency} ${bid.toFixed(0)}`;
  };

  const formatVolume = (volume: number, percentage: number): string => {
    return `${percentage}% full • ${volume}ml`;
  };

  //   const formatNextBid = (currentBid: number): string => {
  //     {/* TODO: use listing bid increment */}
  //     return `${currency} ${(currentBid + 0.5).toFixed(1)}`
  //   }

  const truncateDescription = (
    text: string,
    maxLength: number = 50
  ): string => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const renderHeader = () => {
    switch (listing.listing_type) {
      case ListingType.FIXED_PRICE:
        return (
          <XStack
            position="absolute"
            top="$2"
            left="$2"
            backgroundColor="$muted"
            alignItems="center"
            borderRadius="$5"
            paddingHorizontal="$2"
            paddingVertical="$2"
          >
            <Text fontSize="$2" fontWeight="500" color="$foreground">
              Fixed Price
            </Text>
          </XStack>
        );
      case ListingType.NEGOTIABLE:
        return (
          <XStack
            position="absolute"
            top="$2"
            left="$2"
            backgroundColor="$muted"
            alignItems="center"
            borderRadius="$5"
            paddingHorizontal="$2"
            paddingVertical="$2"
          >
            <Text fontSize="$2" fontWeight="500" color="$foreground">
              Negotiable
            </Text>
          </XStack>
        );
      case ListingType.AUCTION:
        return (
          <XStack
            position="absolute"
            top="$2"
            left="$2"
            right="$2"
            justifyContent="space-between"
            alignItems="center"
          >
            {listing.ends_at && (
              <CountdownTimer endTime={listing.ends_at} size="small" />
            )}
            <XStack
              backgroundColor="$muted"
              alignItems="center"
              borderRadius="$5"
              paddingHorizontal="$2"
              paddingVertical="$2"
            >
              <Text fontSize="$2" fontWeight="500" color="$foreground">
                {listing.bid_count || 0} bid{listing.bid_count === 1 ? "" : "s"}
              </Text>
            </XStack>
          </XStack>
        );

      case ListingType.SWAP:
        return (
          <XStack
            position="absolute"
            top="$2"
            left="$2"
            backgroundColor="$muted"
            alignItems="center"
            borderRadius="$5"
            paddingHorizontal="$2"
            paddingVertical="$2"
          >
            <Text fontSize="$2" fontWeight="500" color="$foreground">
              Swap
            </Text>
          </XStack>
        );

      default:
        return (
          <XStack
            position="absolute"
            top="$2"
            left="$2"
            backgroundColor="$muted"
            alignItems="center"
            borderRadius="$5"
            paddingHorizontal="$2"
            paddingVertical="$2"
          >
            <Text fontSize="$2" fontWeight="500" color="$foreground">
              Buy Now
            </Text>
          </XStack>
        );
    }
  };

  const renderPriceSection = () => {
    switch (listing.listing_type) {
      case ListingType.FIXED_PRICE:
      case ListingType.NEGOTIABLE:
        return (
          <Text fontSize="$3" fontWeight="500" color="$foreground">
            {formatPrice(listing.price)}
          </Text>
        );

      case ListingType.AUCTION:
        return (
          <Text fontSize="$3" fontWeight="500" color="$foreground">
            Current bid: {formatCurrentBid(listing.current_bid || 0)}
          </Text>
        );

      case ListingType.SWAP:
        return (
          <YStack gap="$1">
            {listing.description && (
              <Text
                fontSize="$3"
                color="$foreground"
                fontWeight="500"
                numberOfLines={1}
              >
                Swap: {truncateDescription(listing.description)}
              </Text>
            )}
          </YStack>
        );

      default:
        return (
          <Text fontSize="$3" fontWeight="500" color="$foreground">
            {formatPrice(listing.price)}
          </Text>
        );
    }
  };

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
        );

      case ListingType.AUCTION:
        return (
          <Button
            size="sm"
            variant="secondary"
            onPress={handleActionPress as any}
          >
            {/* Bid {formatNextBid(listing.current_bid || 0)} */}
            Bid Now
          </Button>
        );

      case ListingType.SWAP:
        return (
          <Button
            size="sm"
            variant="secondary"
            onPress={handleActionPress as any}
          >
            Swap
          </Button>
        );

      default:
        return (
          <Button
            size="sm"
            variant="secondary"
            onPress={handleActionPress as any}
          >
            Contact Seller
          </Button>
        );
    }
  };

  return (
    <Card
      size="$3"
      backgroundColor="$background"
      borderRadius="$6"
      py="$2"
      pressStyle={{ scale: 0.99 }}
      onPress={handleCardPress}
      flex={1}
    >
      <YStack gap="$3">
        {/* Product Image */}
        <YStack position="relative">
          {listing.image_url && process.env.EXPO_PUBLIC_IMAGE_BASE_URL ? (
            <Image
              source={{
                uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${listing.image_url}`,
              }}
              width="100%"
              aspectRatio={1}
              borderRadius="$5"
              backgroundColor="$gray2"
            />
          ) : (
            <YStack
              width="100%"
              aspectRatio={1}
              borderRadius="$5"
              backgroundColor="$gray2"
              justifyContent="center"
              alignItems="center"
            >
              <Text color="$mutedForeground">No Image</Text>
            </YStack>
          )}
          {renderHeader()}
          {/* Favorite Button - Bottom Right */}
          <XStack position="absolute" bottom="$2" right="$2">
            <FavoriteButton
              listingId={listing.id}
              initialCount={listing.favorites_count}
              size="small"
            />
          </XStack>
        </YStack>

        {/* Product Info */}
        <YStack flex={1} gap="$1.5">
          <Text
            fontSize="$5"
            fontWeight="500"
            numberOfLines={1}
            color="$foreground"
          >
            {listing.name}
          </Text>

          <Text fontSize="$4" color="$mutedForeground">
            {formatVolume(listing.volume, listing.remaining_percentage)}
          </Text>

          {/* Dynamic price/bid/swap info section */}
          {renderPriceSection()}
        </YStack>

        {/* Dynamic Action Button */}
        {/* {renderActionButton()} */}
      </YStack>
    </Card>
  );
}
