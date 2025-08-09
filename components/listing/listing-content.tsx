import { AuctionDetails, CommentDetails, ListingDetailsResponse, ListingType, UserPreview } from "@bid-scents/shared-sdk";
import { View } from "tamagui";
import { AuctionDetailsSkeleton } from "../suspense/auction-details-skeleton";
import { CommentsHeaderSkeleton } from "../suspense/comments-header-skeleton";
import { CommentsSkeleton } from "../suspense/comments-skeleton";
import { DescriptionSkeleton } from "../suspense/description-skeleton";
import { ListingDetailsSkeleton } from "../suspense/listing-details-skeleton";
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
  isUserSeller?: boolean;
  isLoadingFullData?: boolean;
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
  isUserSeller = false,
  isLoadingFullData = false,
}: ListingContentProps) {
  // Check if this is seeded data (indicates we need skeletons for missing sections)
  const isSeededData = (listing as any)?.__seeded === true;
  return (
    <View
      paddingHorizontal="$4"
      paddingVertical="$2"
      marginBottom={isUserSeller ? "$5" : "$12"}
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
        <View gap="$4">
          {/* Description */}
          {isSeededData || !listing.listing.description ? (
            <DescriptionSkeleton />
          ) : (
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
          )}

          {/* Listing Details */}
          {isSeededData ? (
            <ListingDetailsSkeleton />
          ) : (
            <ListingDetailsSection listing={listing.listing} />
          )}
        </View>

      </View>
      

      {/* Auction Section */}
      {listing.listing.listing_type === ListingType.AUCTION && (
        <>
          {auctionDetails && !isSeededData ? (
            <AuctionSection 
              auctionDetails={auctionDetails}
              isLive={isAuctionLive}
              currentViewers={currentViewers}
            />
          ) : (isSeededData || isLoadingFullData) ? (
            <AuctionDetailsSkeleton />
          ) : null}
        </>
      )}

      {/* Comments Section */}
      <View gap="$4">
        {/* Show skeleton for comments header if using seeded data */}
        {isSeededData || (isLoadingFullData && totalVotes === 0 && isUpvoted === null) ? (
          <CommentsHeaderSkeleton />
        ) : (
          <CommentsHeader
            totalVotes={totalVotes}
            isUpvoted={isUpvoted}
            listingId={listing.listing.id}
          />
        )}

        {/* Show skeleton for comments if using seeded data */}
        {isSeededData || (isLoadingFullData && comments === null) ? (
          <CommentsSkeleton />
        ) : (
          <CommentsSection
            comments={comments}
            userId={userId}
            sellerId={seller.id}
            listingId={listing.listing.id}
          />
        )}
      </View>
    </View>
  );
}