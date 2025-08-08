import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { currency } from "@/constants/constants";
import { AuctionDetails } from "@bid-scents/shared-sdk";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useTheme } from "@tamagui/core";
import * as Haptics from "expo-haptics";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { usePlaceBid } from "../../hooks/queries/use-listing";

export interface BidBottomSheetMethods {
  present: () => void;
  dismiss: () => void;
}

export interface BidBottomSheetProps {
  /** The ID of the auction listing */
  listingId: string;
  /** Full auction details including bids, status, etc. */
  auctionDetails: AuctionDetails | null | undefined;
  /** Optional callback when bid is placed successfully */
  onBidPlaced?: (amount: number) => void;
}

export const BidBottomSheet = forwardRef<
  BidBottomSheetMethods,
  BidBottomSheetProps
>(({ listingId, auctionDetails, onBidPlaced }, ref) => {
  const theme = useTheme();
  const [bidAmount, setBidAmount] = useState("");
  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);
  const placeBidMutation = usePlaceBid();

  // Extract auction data
  const startingPrice = auctionDetails?.starting_price || 0;
  const currentBid = auctionDetails?.bids && auctionDetails.bids.length > 0 
    ? auctionDetails.bids[0].amount 
    : startingPrice;
  const bidIncrement = auctionDetails?.bid_increment || 1;
  
  // Calculate minimum bid (always current bid + increment)
  const minimumBid = currentBid + bidIncrement;
  const numericBidAmount = parseFloat(bidAmount) || 0;
  const isValidBid = bidAmount.trim().length > 0 && numericBidAmount >= minimumBid;
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

    try {
      // Haptic feedback for bid action
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Place the bid using the mutation
      await placeBidMutation.mutateAsync({
        listingId,
        amount: numericBidAmount,
      });

      // Success feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      bottomSheetRef.current?.dismiss();
      setBidAmount("");
      onBidPlaced?.(numericBidAmount);
    } catch (error) {
      // Error feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error("Failed to place bid:", error);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={["37%"]}
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
            Place Your Bid
          </Text>
          <Text fontSize="$4" color="$mutedForeground" textAlign="center">
            Current bid: {currency} {currentBid}
          </Text>
        </YStack>

        {/* Bid input section */}
        <YStack gap="$4" flex={1}>
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
                <Ionicons
                  name="remove-outline"
                  size={24}
                  color={theme.foreground.val}
                />
              </View>

              <BottomSheetTextInput
                style={[
                  styles.bidInput,
                  {
                    backgroundColor: theme.muted?.val,
                    color: theme.foreground?.val,
                    borderColor:
                      bidAmount && !isValidBid
                        ? theme.error?.val
                        : "transparent",
                  },
                ]}
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
                <Ionicons
                  name="add-outline"
                  size={24}
                  color={theme.foreground.val}
                />
              </View>
            </XStack>

            <Text fontSize="$3" color="$mutedForeground" textAlign="center">
              Min bid: {currency} {minimumBid}
            </Text>

            {/* Error messages */}
            {bidAmount && !isValidBid && (
              <Text fontSize="$3" color="$error" textAlign="center">
                Minimum bid is {currency} {minimumBid}
              </Text>
            )}

            {placeBidMutation.isError && (
              <Text fontSize="$3" color="$error" textAlign="center">
                Failed to place bid. Please try again.
              </Text>
            )}
          </YStack>

          {/* Action button */}
          <Button
            onPress={handlePlaceBid}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isValidBid || isLoading}
            borderRadius="$10"
            marginTop="auto"
          >
            {isLoading
              ? "Placing Bid..."
              : `Place Bid • ${currency} ${bidAmount || minimumBid}`}
          </Button>
        </YStack>
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
