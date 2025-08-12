import { Button } from "@/components/ui/button";
import { AuctionDetails } from "@bid-scents/shared-sdk";
import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { View } from "tamagui";
import { BidBottomSheet, BidBottomSheetMethods } from "./bid-bottom-sheet";

interface AuctionButtonProps {
  /** The ID of the auction listing */
  listingId: string;
  /** Full auction details including bids, status, etc. */
  auctionDetails: AuctionDetails | null | undefined;
  /** Whether the auction is currently active */
  isActive?: boolean;
  /** Whether the current user is the highest bidder */
  isCurrentUserHighestBidder?: boolean;
  /** Optional callback when bid is placed successfully */
  onBidPlaced?: (amount: number) => void;
}

/**
 * Auction button that opens a bottom sheet for placing bids
 */
export default function AuctionButton({
  listingId,
  auctionDetails,
  isActive = true,
  isCurrentUserHighestBidder = false,
  onBidPlaced
}: AuctionButtonProps) {
  const bidBottomSheetRef = useRef<BidBottomSheetMethods>(null);

  const handleBidPress = async () => {
    if (!isActive) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bidBottomSheetRef.current?.present();
  };

  return (
    <>
      <View
        paddingHorizontal="$4"
        paddingBottom="$4"
        backgroundColor="transparent"
        position="absolute"
        bottom={10}
        left={0}
        right={0}
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleBidPress}
          disabled={!isActive}
          borderRadius="$10"
        >
          {!isActive 
            ? "Auction Ended" 
            : isCurrentUserHighestBidder 
            ? "Winning" 
            : "Place a Bid"}
        </Button>
      </View>

      <BidBottomSheet
        ref={bidBottomSheetRef}
        listingId={listingId}
        auctionDetails={auctionDetails}
        isCurrentUserHighestBidder={isCurrentUserHighestBidder}
        onBidPlaced={onBidPlaced}
      />
    </>
  );
}
