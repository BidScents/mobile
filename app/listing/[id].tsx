import { AuctionSection } from "@/components/listing/auction-section";
import BottomButton from "@/components/listing/bottom-button";
import { CommentsSection } from "@/components/listing/comments-section";
import { ImageCarousel } from "@/components/listing/image-carousel";
import { ListingDetailsSection } from "@/components/listing/listing-details-section";
import { SellerCard } from "@/components/listing/sellar-card";
import { VoteButtons } from "@/components/listing/vote-buttons";
import { Container } from "@/components/ui/container";
import { currency } from "@/constants/constants";
import { ListingType } from "@bid-scents/shared-sdk";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Dimensions } from "react-native";
import { ScrollView, Text, View, YStack } from "tamagui";
import { useListingDetail } from "../../hooks/queries/use-listing";

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, error } = useListingDetail(id!);
  const width = Dimensions.get("window").width;
  const height = Dimensions.get("window").height * 0.5;
  const listingType = listing?.listing.listing_type;

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
      <ScrollView>
        {/* Image Carousel */}
        <ImageCarousel
          imageUrls={listing.image_urls}
          width={width}
          height={height}
          listingId={listing.listing.id}
          favoritesCount={listing.favorites_count}
        />

        <View paddingHorizontal="$4" paddingVertical="$2" marginBottom="$12">
          {/* Seller Card */}
          <SellerCard seller={listing.seller} />

          {/* Listing Details */}
          <YStack gap="$1">
            <Text fontSize="$7" fontWeight="500">
              {listing.listing.name}
            </Text>
            <Text fontSize="$6" fontWeight="400">
              {listing.listing.brand}
            </Text>
            <Text fontSize="$6" fontWeight="500">
              {currency}{" "}
              {listingType === ListingType.FIXED_PRICE ||
              listingType === ListingType.NEGOTIABLE
                ? listing.listing.price
                : listingType}
            </Text>
          </YStack>

          {/* Listing Description */}
          <YStack gap="$1">
            <Text fontSize="$5" fontWeight="400">
              {listing.listing.description}
            </Text>

            {/*Listing Details*/}
            <ListingDetailsSection listing={listing.listing} />
          </YStack>

          {/* Like/Dislike Buttons */}
          <VoteButtons
            totalVotes={listing.total_votes}
            isUpvoted={listing.is_upvoted}
            listingId={listing.listing.id}
          />

          {/* Auction Data */}
          {listingType === ListingType.AUCTION && (
            <AuctionSection auctionDetails={listing.auction_details} />
          )}

          {/* Comments */}
          <CommentsSection comments={listing.comments} />
        </View>
      </ScrollView>

      {/* Submit Button - Fixed at bottom */}
     <BottomButton listingType={listingType!} isLoading={isLoading} auctionPress={bidNow} onPress={contactSeller}/>

    </Container>
  );
}
