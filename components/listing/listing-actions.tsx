import { ListingType } from "@bid-scents/shared-sdk";
import AuctionButton from "./auction-button";
import BottomButton from "./bottom-button";

interface ListingActionsProps {
  listingType: ListingType;
  isLoading: boolean;
  onAction: () => void;
}

/**
 * Bottom action buttons for listing detail page
 * Shows different button based on listing type (auction vs fixed price)
 */
export function ListingActions({ listingType, isLoading, onAction }: ListingActionsProps) {
  return listingType === ListingType.AUCTION ? (
    <AuctionButton isLoading={isLoading} onPress={onAction} />
  ) : (
    <BottomButton isLoading={isLoading} onPress={onAction} />
  );
}