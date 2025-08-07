import { AuctionDetails, ListingType } from "@bid-scents/shared-sdk";
import AuctionButton from "./auction-button";
import BottomButton from "./bottom-button";

interface ListingActionsProps {
  listingType: ListingType;
  listingId: string;
  auctionDetails?: AuctionDetails | null | undefined;
  isLoading: boolean;
  onAction: () => void;
}

/**
 * Bottom action buttons for listing detail page
 * Shows different button based on listing type (auction vs fixed price)
 */
export function ListingActions({ 
  listingType, 
  listingId,
  auctionDetails,
  isLoading, 
  onAction 
}: ListingActionsProps) {
  return listingType === ListingType.AUCTION ? (
    <AuctionButton 
      listingId={listingId}
      auctionDetails={auctionDetails}
      isActive={!isLoading}
      onBidPlaced={() => onAction()}
    />
  ) : (
    <BottomButton isLoading={isLoading} onPress={onAction} />
  );
}