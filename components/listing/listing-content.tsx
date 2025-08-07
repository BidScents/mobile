import { AuctionDetails, CommentDetails, ListingDetailsResponse, ListingType, UserPreview } from "@bid-scents/shared-sdk";
import { View } from "tamagui";
import { ShowMoreText } from "../ui/show-more-text";
import { AuctionSection } from "./auction-section";
import { CommentsHeader } from "./comments-header";
import { CommentsSection } from "./comments-section";
import { ListingDetailsSection } from "./listing-details-section";
import { ListingHeader } from "./listing-header";
import { SellerCard } from "./sellar-card";

interface ListingContentProps {
  listing: ListingDetailsResponse;
  seller: UserPreview;
  auctionDetails: AuctionDetails | null | undefined;
  comments: CommentDetails[] | null | undefined;
  totalVotes: number;
  isUpvoted: boolean | null | undefined;
  userId: string | undefined;
  isAuctionLive?: boolean;
  currentViewers?: number;
}

/**
 * Main content area of listing detail page
 * Contains all listing information, seller details, and comments
 */
export function ListingContent({
  listing,
  seller,
  auctionDetails,
  comments,
  totalVotes,
  isUpvoted,
  userId,
  isAuctionLive = false,
  currentViewers,
}: ListingContentProps) {
  return (
    <View
      paddingHorizontal="$4"
      paddingVertical="$2"
      marginBottom="$12"
      gap="$6"
    >
      <View gap="$2">
        {/* Seller Card */}
        <SellerCard seller={seller} />

        {/* Listing Header */}
        <ListingHeader
          name={listing.listing.name}
          brand={listing.listing.brand}
          price={listing.listing.price}
          listingType={listing.listing.listing_type}
        />

        {/* Description */}
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

      {/* Listing Details */}
      <ListingDetailsSection listing={listing.listing} />

      {/* Auction Section */}
      {listing.listing.listing_type === ListingType.AUCTION && auctionDetails && (
        <AuctionSection 
          auctionDetails={auctionDetails}
          isLive={isAuctionLive}
          currentViewers={currentViewers}
        />
      )}

      {/* Comments Section */}
      <View gap="$4">
        <CommentsHeader
          totalVotes={totalVotes}
          isUpvoted={isUpvoted}
          listingId={listing.listing.id}
        />

        <CommentsSection
          comments={comments}
          userId={userId}
          sellerId={seller.id}
          listingId={listing.listing.id}
        />
      </View>
    </View>
  );
}