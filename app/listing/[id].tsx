import { AuctionSection } from "@/components/listing/auction-section";
import BottomButton from "@/components/listing/bottom-button";
import { CommentsSection } from "@/components/listing/comments-section";
import { ImageCarousel } from "@/components/listing/image-carousel";
import { ListingDetailsSection } from "@/components/listing/listing-details-section";
import { SellerCard } from "@/components/listing/sellar-card";
import { VoteButtons } from "@/components/listing/vote-buttons";
import { Container } from "@/components/ui/container";
import { ShowMoreText } from "@/components/ui/show-more-text";
import { currency } from "@/constants/constants";
import { ListingType, useAuthStore } from "@bid-scents/shared-sdk";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Dimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Separator, Text, View, XStack } from "tamagui";
import { useListingDetail } from "../../hooks/queries/use-listing";

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, error } = useListingDetail(id!);
  const width = Dimensions.get("window").width;
  const height = Dimensions.get("window").height * 0.55;
  const listingType = listing?.listing.listing_type;
  const { user } = useAuthStore();
  const isUserSeller = user?.id === listing?.seller.id;

  const contactSeller = () => {
    console.log("Contact seller");
  };

  const bidNow = () => {
    console.log("Bid now");
  };

  if (isLoading)
    return (
      <Container
        variant="padded"
        safeArea={["top", "bottom"]}
        backgroundColor="$background"
      >
        <Text>Loading...</Text>
      </Container>
    );
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
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
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
          gap="$5"
        >
          <View gap="$2">
            {/* Seller Card */}
            <SellerCard seller={listing.seller} />

            {/* Listing Details */}
            <XStack alignItems="flex-end" justifyContent="flex-start" gap="$2">
              <Text fontSize="$7" fontWeight="500" color="$foreground">
                {listing.listing.name}
              </Text>
              <Separator vertical height={20} borderColor="$mutedForeground" />
              <Text fontSize="$5" fontWeight="400" color="$mutedForeground">
                {listing.listing.brand}
              </Text>
            </XStack>
            <Text fontSize="$7" fontWeight="500" color="$foreground">
              {currency}{" "}
              {listingType === ListingType.FIXED_PRICE ||
              listingType === ListingType.NEGOTIABLE
                ? listing.listing.price
                : listingType}
            </Text>

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

          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize="$7" fontWeight="500">
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
          />
        </View>
      </KeyboardAwareScrollView>

      {/* Submit Button - Fixed at bottom */}
      {!isUserSeller && (
        <BottomButton
          listingType={listingType!}
          isLoading={isLoading}
          auctionPress={bidNow}
          onPress={contactSeller}
        />
      )}
    </Container>
  );
}
