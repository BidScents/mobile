import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { currency } from "@/constants/constants";
import { AuctionDetails } from "@bid-scents/shared-sdk";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import * as Haptics from "expo-haptics";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { usePlaceBid } from "../../hooks/queries/use-listing";
import { useThemeColors } from "../../hooks/use-theme-colors";
import { ThemedIonicons } from "../ui/themed-icons";

export interface BidBottomSheetMethods {
  present: () => void;
  dismiss: () => void;
}

export interface BidBottomSheetProps {
  /** The ID of the auction listing */
  listingId: string;
  /** Full auction details including bids, status, etc. */
  auctionDetails: AuctionDetails | null | undefined;
  /** Whether the current user is the highest bidder */
  isCurrentUserHighestBidder?: boolean;
}

export const BidBottomSheet = forwardRef<
  BidBottomSheetMethods,
  BidBottomSheetProps
>(({ listingId, auctionDetails, isCurrentUserHighestBidder = false }, ref) => {
  const colors = useThemeColors();
  const [bidAmount, setBidAmount] = useState("");
  
  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);
  const placeBidMutation = usePlaceBid();

  // Extract auction data
  const startingPrice = auctionDetails?.starting_price || 0;
  const currentBid = auctionDetails?.bids && auctionDetails.bids.length > 0 
    ? auctionDetails.bids[0].amount 
    : startingPrice;
  const bidIncrement = auctionDetails?.bid_increment || 1;
  
  // Note: isCurrentUserHighestBidder is now passed as a prop to avoid duplicate logic
  
  // Calculate minimum bid (always current bid + increment)
  const minimumBid = currentBid + bidIncrement;
  const numericBidAmount = parseFloat(bidAmount) || 0;
  const isValidBid = bidAmount.trim().length > 0 && numericBidAmount >= minimumBid && !isCurrentUserHighestBidder;
  
  const bidInputStyles = [
    styles.bidInput,
    {
      backgroundColor: colors.muted,
      color: colors.foreground,
      borderColor:
        bidAmount && !isValidBid
          ? colors.error
          : "transparent",
    },
  ];
  const isLoading = placeBidMutation.isPending;

  useImperativeHandle(ref, () => ({
    present: () => {
      setBidAmount(String(minimumBid));
      bottomSheetRef.current?.present();
    },
    dismiss: () => bottomSheetRef.current?.dismiss(),
  }));

  const handleIncreaseBid = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    setBidAmount(String(numericBidAmount + 1));
  };

  const handleDecreaseBid = () => {
    const newAmount = numericBidAmount - bidIncrement;
    
    if (newAmount < minimumBid) {
      // Show alert when can't decrease further
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Alert.alert(
        "Minimum Bid Reached", 
        `Cannot go below the minimum bid of ${currency}${minimumBid}`,
        [{ text: "OK", style: "default" }]
      );
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    setBidAmount(String(newAmount));
  };

  const handlePlaceBid = async () => {
    if (!isValidBid) return;

    // Client-side validation: prevent API call if user is already highest bidder
    if (isCurrentUserHighestBidder) {
      console.log("⚠️ Client-side validation: User is already the highest bidder, preventing API call");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    console.log("Placing bid:", numericBidAmount, "for listing:", listingId);

    try {
      // Haptic feedback for bid action
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Place the bid using the mutation
      await placeBidMutation.mutateAsync({
        listingId,
        amount: numericBidAmount,
      });

      console.log("✅ Bid placed successfully");

      // Success feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      bottomSheetRef.current?.dismiss();
      setBidAmount("");
    } catch (error: any) {
      console.log("❌ Failed to place bid:", error?.body?.detail || error?.message || error);
      
      // Error feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      enablePanDownToClose={true}
      keyboardBehavior="interactive"
      enableDynamicSizing={true}
      onDismiss={() => {
        setBidAmount("");
      }}
    >
      <YStack
        flex={1}
        paddingHorizontal="$4"
        paddingTop="$4"
        paddingBottom="$4"
      >
        {/* Header */}
        <YStack gap="$3" marginBottom="$4">
          <Text fontSize="$6" fontWeight="700" color="$foreground" textAlign="center">
            {isCurrentUserHighestBidder ? "You're the Highest Bidder" : "Place Your Bid"}
          </Text>
          <Text fontSize="$4" color="$mutedForeground" textAlign="center">
            Current bid: {currency} {currentBid}
          </Text>
        </YStack>

        {/* Bid input section */}
        <YStack gap="$4" flex={1}>
          {!isCurrentUserHighestBidder && (
            <YStack gap="$3">
              <XStack alignItems="center" gap="$3">
                <View
                  p="$3"
                  backgroundColor="$muted"
                  borderRadius="$6"
                  pressStyle={{ backgroundColor: "$mutedPress" }}
                  onPress={handleDecreaseBid}
                  alignItems="center"
                  justifyContent="center"
                >
                  <ThemedIonicons
                    name="remove-outline"
                    size={24}
                  />
                </View>

                <BottomSheetTextInput
                  style={bidInputStyles}
                  placeholder={`${currency} 0`}
                  value={bidAmount ? `${currency} ${bidAmount}` : ""}
                  onChangeText={(text) => setBidAmount(text.replace(currency, "").trim())}
                  keyboardType="numeric"
                  textAlign="center"
                  editable={!isLoading}
                />

                <View
                  p="$3"
                  backgroundColor="$muted"
                  borderRadius="$6"
                  pressStyle={{ backgroundColor: "$mutedPress" }}
                  onPress={handleIncreaseBid}
                  alignItems="center"
                  justifyContent="center"
                >
                  <ThemedIonicons
                    name="add-outline"
                    size={24}
                  />
                </View>
              </XStack>

              <Text fontSize="$3" color="$mutedForeground" textAlign="center">
                Min bid: {currency} {minimumBid}
              </Text>

              {/* Error messages */}
              {bidAmount && !isValidBid && !isCurrentUserHighestBidder && (
                <Text fontSize="$3" color="$error" textAlign="center">
                  Minimum bid is {currency} {minimumBid}
                </Text>
              )}

              {placeBidMutation.isError && (
                <Text fontSize="$3" color="$error" textAlign="center" mb="$2">
                  {(placeBidMutation.error as any)?.body?.detail || "Failed to place bid. Please try again."}
                </Text>
              )}
            </YStack>
          )}
        </YStack>

        {/* Action button */}
        <Button
          onPress={isCurrentUserHighestBidder ? () => bottomSheetRef.current?.dismiss() : handlePlaceBid}
          variant={isCurrentUserHighestBidder ? "secondary" : "primary"}
          size="lg"
          fullWidth
          disabled={(!isValidBid || isLoading) && !isCurrentUserHighestBidder}
          borderRadius="$10"
          marginTop="auto"
        >
          {isCurrentUserHighestBidder
            ? "Close"
            : isLoading
            ? "Placing Bid..."
            : `Place Bid • ${currency} ${bidAmount || minimumBid}`}
        </Button>
      </YStack>
    </BottomSheet>
  );
});

BidBottomSheet.displayName = "BidBottomSheet";

const styles = StyleSheet.create({
  bidInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    textAlign: "center",
  },
});
