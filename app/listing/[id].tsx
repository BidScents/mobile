import { ImageCarousel } from "@/components/listing/image-carousel";
import { ListingActions } from "@/components/listing/listing-actions";
import { ListingContent } from "@/components/listing/listing-content";
import { ListingDetailSkeleton } from "@/components/suspense/listing-detail-skeleton";
import { BlurBackButton } from "@/components/ui/blur-back-button";
import { Container } from "@/components/ui/container";
import { ListingDetailsResponse, useAuthStore } from "@bid-scents/shared-sdk";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Dimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Text } from "tamagui";
import { queryKeys } from "../../hooks/queries/query-keys";
import { useListingDetail } from "../../hooks/queries/use-listing";
import { useStableWebSocket } from "../../hooks/use-stable-websocket";

/**
 * Listing detail screen component
 * Displays comprehensive listing information with modular components
 */
export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, error } = useListingDetail(id!);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const width = Dimensions.get("window").width;
  const height = Dimensions.get("window").height * 0.55;

  // Track auction viewer count using ref to prevent re-renders
  const currentViewersRef = useRef<number | undefined>(undefined);
  const [, forceUpdate] = useState({});
  const forceUpdateUI = useCallback(() => forceUpdate({}), []);

  // Connect to auction WebSocket for real-time updates
  const shouldConnectToAuction = useMemo(() => {
    const isAuctionListing = listing?.listing?.listing_type === "AUCTION";
    const hasAuctionDetails = !!listing?.auction_details;
    return isAuctionListing && hasAuctionDetails && !!id;
  }, [listing?.listing?.listing_type, listing?.auction_details, id]);

  // Use stable WebSocket that won't cause re-renders
  const { isConnected } = useStableWebSocket({
    listingId: id!,
    enabled: shouldConnectToAuction,
    onConnect: () => {
      console.log("🟢 Auction WebSocket connected");
    },
    onDisconnect: () => {
      console.log("🔴 Auction WebSocket disconnected");
    },
    onViewerCount: (count) => {
      currentViewersRef.current = count;
      forceUpdateUI();
    },
    onBid: async (bidData) => {
      console.log("💰 New bid received:", bidData);

      // Skip if it's the current user's own bid
      if (bidData.bidder?.id === user?.id) {
        return;
      }

      // Haptic feedback for new bid
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Optimistically update cache with new bid data
      queryClient.setQueryData<ListingDetailsResponse>(
        queryKeys.listings.detail(id!),
        (old) => {
          if (!old || !old.auction_details) return old;

          return {
            ...old,
            auction_details: {
              ...old.auction_details,
              bid_count: bidData.bid_count,
              bids: bidData
                ? [
                    {
                      id: bidData.id,
                      amount: bidData.amount,
                      bidder: bidData.bidder,
                      created_at: bidData.created_at,
                    },
                    ...(old.auction_details.bids || []).slice(0, 4), // Keep only recent bids
                  ]
                : old.auction_details.bids,
            },
          };
        }
      );

      // Show toast notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "New Bid!",
          body: `${bidData.bidder?.username || "Someone"} bid $${
            bidData.amount
          }`,
          sound: false,
        },
        trigger: null,
      });
    },
  });

  const handleContactSeller = () => {
    console.log("Contact seller");
  };

  if (isLoading) {
    return <ListingDetailSkeleton width={width} />;
  }
  if (error)
    return (
      <Container
        variant="padded"
        safeArea={["top", "bottom"]}
        backgroundColor="$background"
      >
        <Text>Error loading listing</Text>
      </Container>
    );
  if (!listing)
    return (
      <Container
        variant="padded"
        safeArea={["top", "bottom"]}
        backgroundColor="$background"
      >
        <Text>Listing not found</Text>
      </Container>
    );

  return (
    <Container
      variant="fullscreen"
      safeArea={false}
      backgroundColor="$background"
    >
      {/* Back Button */}
      <BlurBackButton />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image Carousel */}
        <ImageCarousel
          imageUrls={listing.image_urls}
          width={width}
          height={height}
          listingId={listing.listing.id}
          favoritesCount={listing.favorites_count}
        />

        {/* Listing Content */}
        <ListingContent
          listing={listing}
          seller={listing.seller}
          auctionDetails={listing.auction_details}
          comments={listing.comments}
          totalVotes={listing.total_votes}
          isUpvoted={listing.is_upvoted}
          userId={user?.id}
          isAuctionLive={isConnected}
          currentViewers={currentViewersRef.current}
        />
      </KeyboardAwareScrollView>

      {/* Action Buttons */}
      <ListingActions
        listingType={listing.listing.listing_type}
        isLoading={isLoading}
        onAction={handleContactSeller}
      />
    </Container>
  );
}
