import AuctionButton from "@/components/listing/auction-button";
import { AuctionSection } from "@/components/listing/auction-section";
import BottomButton from "@/components/listing/bottom-button";
import { CommentsSection } from "@/components/listing/comments-section";
import { ImageCarousel } from "@/components/listing/image-carousel";
import { ListingDetailsSection } from "@/components/listing/listing-details-section";
import { SellerCard } from "@/components/listing/sellar-card";
import { VoteButtons } from "@/components/listing/vote-buttons";
import { ListingDetailSkeleton } from "@/components/suspense/listing-detail-skeleton";
import { BlurBackButton } from "@/components/ui/blur-back-button";
import { Container } from "@/components/ui/container";
import { ShowMoreText } from "@/components/ui/show-more-text";
import { currency } from "@/constants/constants";
import { ListingType, useAuthStore } from "@bid-scents/shared-sdk";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Dimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Text, View, XStack } from "tamagui";
import { useListingDetail } from "../../hooks/queries/use-listing";

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, error } = useListingDetail(id!);
  const width = Dimensions.get("window").width;
  const height = Dimensions.get("window").height * 0.55;
  const listingType = listing?.listing.listing_type;
  const { user } = useAuthStore();
  const isUserSeller = user?.id === listing?.seller.id;

  console.log("Votes", listing?.total_votes);

  const contactSeller = () => {
    console.log("Contact seller");
  };

  const bidNow = () => {
    console.log("Bid now");
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

        <View
          paddingHorizontal="$4"
          paddingVertical="$2"
          marginBottom="$12"
          gap="$6"
        >
          <View gap="$2">
            {/* Seller Card */}
            <SellerCard seller={listing.seller} />

            {/* Listing Details */}
            <View gap="$3">
              <View>
                <Text
                  fontSize="$8"
                  fontWeight="600"
                  color="$foreground"
                  lineHeight="$8"
                >
                  {listing.listing.name}
                </Text>
                <Text
                  fontSize="$4"
                  fontWeight="400"
                  color="$mutedForeground"
                  marginTop="$1"
                >
                  {listing.listing.brand}
                </Text>
              </View>

              <Text fontSize="$7" fontWeight="600" color="$foreground">
                {currency}
                {listingType === ListingType.FIXED_PRICE ||
                listingType === ListingType.NEGOTIABLE
                  ? listing.listing.price
                  : listingType}
              </Text>
            </View>

            <ShowMoreText
              lines={3}
              more="Show more"
              less="Show less"
              fontSize="$5"
              color="$foreground"
              fontWeight="400"
              buttonColor="$blue10"
            >
              {listing.listing.description}
            </ShowMoreText>
          </View>

          {/*Listing Details*/}
          <ListingDetailsSection listing={listing.listing} />

          {/* Auction Data */}
          {listingType === ListingType.AUCTION && (
            <AuctionSection auctionDetails={listing.auction_details} />
          )}

          <View gap="$4">
            <XStack alignItems="center" justifyContent="space-between">
              <Text fontSize="$8" fontWeight="600" color="$foreground">
                Comments
              </Text>

              {/* Like/Dislike Buttons */}
              <VoteButtons
                totalVotes={listing.total_votes}
                isUpvoted={listing.is_upvoted}
                listingId={listing.listing.id}
              />
            </XStack>

            {/* Comments */}
            <CommentsSection
              comments={listing.comments}
              userId={user?.id}
              sellerId={listing.seller.id}
              listingId={listing.listing.id}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Submit Button - Fixed at bottom */}
      {listingType === ListingType.AUCTION ? (
        <AuctionButton isLoading={isLoading} onPress={contactSeller} />
      ) : (
        <BottomButton isLoading={isLoading} onPress={contactSeller} />
      )}
    </Container>
  );
}
