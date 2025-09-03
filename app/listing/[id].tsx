import { ImageCarousel } from "@/components/listing/image-carousel";
import { ListingActions } from "@/components/listing/listing-actions";
import { ListingContent } from "@/components/listing/listing-content";
import { ListingDetailSkeleton } from "@/components/suspense/listing-detail-skeleton";
import { BlurBackButton } from "@/components/ui/blur-back-button";
import { Container } from "@/components/ui/container";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, AppStateStatus, Dimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Text } from "tamagui";
import { useListingDetail } from "../../hooks/queries/use-listing";
import { useContactSeller } from "../../hooks/queries/use-messages";
import { useAuctionWebSocket } from "../../hooks/use-auction-websocket";
import { useAuctionWebSocketHandlers } from "../../hooks/use-auction-websocket-handlers";
import { isCurrentUserHighestBidder as checkIsCurrentUserHighestBidder } from "../../utils/auction-helpers";

/**
 * Listing detail screen component
 * Displays comprehensive listing information with modular components
 */
export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: listing, isLoading, error, isFetching } = useListingDetail(id!);
  const { user } = useAuthStore();
  const contactSellerMutation = useContactSeller();

  const width = Dimensions.get("window").width;
  const height = Dimensions.get("window").height * 0.5;

  // Track auction viewer count using ref to prevent re-renders
  const currentViewersRef = useRef<number | undefined>(undefined);
  const [, forceUpdate] = useState({});
  const forceUpdateUI = useCallback(() => forceUpdate({}), []);
  
  // Track app state for WebSocket connection management
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  // Set up AppState listener for WebSocket lifecycle management
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setAppState(nextAppState);
    });

    return () => subscription.remove();
  }, []);

  // Determine if WebSocket should connect for auction listings
  const shouldConnectToAuction = useMemo(() => {
    const isAuctionListing = listing?.listing?.listing_type === "AUCTION";
    const hasAuctionDetails = !!listing?.auction_details;
    const isAppActive = appState === "active";
    return isAuctionListing && hasAuctionDetails && !!id && isAppActive;
  }, [listing?.listing?.listing_type, listing?.auction_details, id, appState]);

  // Check if current user is highest bidder (calculated once here to avoid duplication)
  const isCurrentUserHighestBidder = useMemo(() => {
    return checkIsCurrentUserHighestBidder(listing?.auction_details, user?.id);
  }, [listing?.auction_details, user?.id]);

  const isUserSeller = useMemo(() => {
    return listing?.seller.id === user?.id;
  }, [listing?.seller.id, user?.id]);

  // Get modular WebSocket event handlers
  const {
    handleConnect,
    handleDisconnect,
    handleViewerCount,
    handleBid,
    handleExtension,
  } = useAuctionWebSocketHandlers({
    listingId: id!,
    currentUserId: user?.id,
    onUIUpdate: forceUpdateUI,
    viewerCountRef: currentViewersRef,
  });

  // Connect to auction WebSocket for real-time updates
  const { isConnected } = useAuctionWebSocket({
    listingId: id!,
    enabled: shouldConnectToAuction,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onViewerCount: handleViewerCount,
    onBid: handleBid,
    onExtension: handleExtension,
  });

  const handleContactSeller = useCallback(() => {
    if (!listing?.seller?.id) {
      console.error("No seller ID available");
      return;
    }

    contactSellerMutation.mutate(listing.seller.id, {
      onSuccess: (conversationResponse) => {
        // Navigate to the chat screen with the conversation ID
        router.push(`/(screens)/(chat)/${conversationResponse.id}`);
      },
      onError: (error) => {
        console.error("Error contacting seller:", error);
        //show an error toast here
      },
    });
  }, [listing?.seller?.id, contactSellerMutation, router]);

  // Show skeleton only if no data at all (no seeded cache)
  if (isLoading && !listing) {
    return <ListingDetailSkeleton width={width} />;
  }
  
  if (error && !listing)
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
        bottomOffset={15}
        keyboardDismissMode="on-drag"
      >
        {/* Image Carousel */}
        <ImageCarousel
          imageUrls={listing.image_urls}
          width={width}
          height={height}
          listingId={listing.listing.id}
          favoritesCount={listing.favorites_count}
          hidePagination={(listing as any)?.__seeded === true}
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
          isUserSeller={isUserSeller}
          isLoadingFullData={isFetching}
        />
      </KeyboardAwareScrollView>

      {/* Action Buttons */}
      {!isUserSeller && (
        <ListingActions
          listingType={listing.listing.listing_type}
          listingId={listing.listing.id}
          auctionDetails={listing.auction_details}
          isCurrentUserHighestBidder={isCurrentUserHighestBidder}
          isLoading={isLoading || (listing as any)?.__seeded === true || contactSellerMutation.isPending}
          onAction={handleContactSeller}
        />
      )}
    </Container>
  );
}
