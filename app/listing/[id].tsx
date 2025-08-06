import { ImageCarousel } from "@/components/listing/image-carousel";
import { ListingActions } from "@/components/listing/listing-actions";
import { ListingContent } from "@/components/listing/listing-content";
import { ListingDetailSkeleton } from "@/components/suspense/listing-detail-skeleton";
import { BlurBackButton } from "@/components/ui/blur-back-button";
import { Container } from "@/components/ui/container";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Dimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Text } from "tamagui";
import { useListingDetail } from "../../hooks/queries/use-listing";

/**
 * Listing detail screen component
 * Displays comprehensive listing information with modular components
 */
export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, error } = useListingDetail(id!);
  const { user } = useAuthStore();
  
  const width = Dimensions.get("window").width;
  const height = Dimensions.get("window").height * 0.55;

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
