import { AvatarIcon } from "@/components/ui/avatar-icon";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { currency } from "@/constants/constants";
import {
  useMarkNoResponse,
  useSettleAuctionTransaction,
  useSettlementDetails,
} from "@/hooks/queries/use-dashboard";
import { calculateTimeLeft, formatTimeLeft } from "@/utils/countdown";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { router } from "expo-router";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Alert } from "react-native";
import { ScrollView, Text, XStack, YStack } from "tamagui";
import { CountdownTicker } from "../listing/countdown-ticker";

export interface SettlementBottomSheetMethods {
  present: () => void;
  dismiss: () => void;
}

export interface SettlementBottomSheetProps {
  id: string;
}

// Helper hook to manage countdown timer
const useCountdown = (deadline: string | null) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!deadline) {
      setTimeLeft("");
      setIsExpired(false);
      return;
    }

    const updateCountdown = () => {
      const timeRemaining = calculateTimeLeft(deadline);

      if (!timeRemaining) {
        setTimeLeft("Deadline passed");
        setIsExpired(true);
        return;
      }

      setTimeLeft(formatTimeLeft(timeRemaining));
      setIsExpired(false);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deadline]);

  return { timeLeft, isExpired };
};

export const SettlementBottomSheet = forwardRef<
  SettlementBottomSheetMethods,
  SettlementBottomSheetProps
>(({ id }, ref) => {
  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // Only fetch data when bottom sheet is open
  const { data, isLoading, error, refetch } = useSettlementDetails(id, {
    enabled: isOpen
  });
  
  const settleTransaction = useSettleAuctionTransaction();
  const markNoResponse = useMarkNoResponse();
  const [showAllBidders, setShowAllBidders] = useState(false);

  const { timeLeft, isExpired } = useCountdown(
    data?.settlement_deadline || null
  );

  useImperativeHandle(ref, () => ({
    present: () => {
      setIsOpen(true); // Enable data fetching
      bottomSheetRef.current?.present();
    },
    dismiss: () => {
      bottomSheetRef.current?.dismiss();
      // Keep isOpen true to maintain cached data
    },
  }));

  const clickBidder = (bidderId: string) => {
    bottomSheetRef.current?.dismiss();
    router.push(`/profile/${bidderId}`);
  };

  const handleStartSettlement = async () => {
    if (!data?.top_bids?.[0]) return;

    try {
      await settleTransaction.mutateAsync(id);
      refetch(); // Refresh data after settlement starts
    } catch (error) {
      Alert.alert("Error", "Failed to start settlement. Please try again.");
    }
  };

  const handleMarkNoResponse = async () => {
    if (!data?.top_bids?.[0]) return;

    Alert.alert(
      "Mark as No Response",
      `Mark ${data.top_bids[0].bidder?.username} as no response? This will ban them from bidding for 2 weeks and move to the next bidder.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark No Response",
          style: "destructive",
          onPress: async () => {
            try {
              await markNoResponse.mutateAsync(id);
              refetch(); // Refresh data after marking no response
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to mark as no response. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const renderContent = () => {
    // Show empty state when not opened yet (no data fetching)
    if (!isOpen) {
      return (
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          padding="$6"
        >
          <Text color="$mutedForeground">Opening settlement details...</Text>
        </YStack>
      );
    }

    if (isLoading) {
      return (
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          padding="$6"
        >
          <Text color="$mutedForeground">Loading settlement details...</Text>
        </YStack>
      );
    }

    if (error) {
      return (
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          padding="$6"
        >
          <ThemedIonicons
            name="alert-circle-outline"
            size={48}
            color="$red10"
          />
          <Text color="$foreground" fontWeight="600" marginTop="$3">
            Error Loading Settlement
          </Text>
          <Text color="$mutedForeground" textAlign="center" marginTop="$2">
            Unable to load settlement details. Please try again.
          </Text>
        </YStack>
      );
    }

    if (!data?.top_bids?.length) {
      return (
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          padding="$6"
        >
          <ThemedIonicons
            name="hourglass-outline"
            size={48}
            color="$mutedForeground"
          />
          <Text color="$foreground" fontWeight="600" marginTop="$3">
            No Bids Available
          </Text>
          <Text color="$mutedForeground" textAlign="center" marginTop="$2">
            There are no remaining bids for this auction.
          </Text>
        </YStack>
      );
    }

    const hasActiveSettlement = data.has_active_settlement;

    return (
      <YStack gap="$4" padding="$4" paddingBottom="$5">
        {/* Header */}
        <YStack gap="$2">
          <Text fontSize="$7" fontWeight="600" color="$foreground">
            Auction Settlement
          </Text>
          <Text color="$mutedForeground" fontSize="$4" lineHeight="$5">
            {hasActiveSettlement
              ? "Manage active settlement with highest bidder."
              : "Send transaction message to the highest bidder."}
          </Text>
        </YStack>

        {/* Settlement Status */}
        {hasActiveSettlement && (
          <YStack
            gap="$1"
            padding="$3"
            borderRadius="$6"
            borderWidth={1}
            borderColor="$border"
          >
            <XStack alignItems="center" gap="$2">
              <ThemedIonicons
                name={isExpired ? "time-outline" : "timer-outline"}
                size={20}
                color={isExpired ? "$error" : "$foreground"}
              />
              <Text
                fontSize="$5"
                fontWeight="600"
                color={isExpired ? "$error" : "$foreground"}
              >
                {isExpired ? "Deadline Passed" : "Waiting for buyer's response"}
              </Text>
            </XStack>
            <CountdownTicker endsAt={data.settlement_deadline || ""} />
          </YStack>
        )}

        {/* Top Bidder Card */}
        <YStack gap="$3">
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize="$6" fontWeight="600" color="$foreground">
              Bidders
            </Text>
            {data.top_bids.length > 4 && (
              <XStack
                alignItems="center"
                gap="$1"
                onPress={() => setShowAllBidders(!showAllBidders)}
                hitSlop={20}
              >
                <Text fontSize="$3" fontWeight="500" color="$mutedForeground">
                  {showAllBidders
                    ? "Show Less"
                    : `+${data.top_bids.length - 4} more`}
                </Text>
                <ThemedIonicons
                  name={showAllBidders ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="$mutedForeground"
                />
              </XStack>
            )}
          </XStack>
        </YStack>

        {/* Other Bidders */}
        {data.top_bids.length > 1 && (
          <YStack>
            <ScrollView
              gap="$2"
              maxHeight={showAllBidders ? 300 : undefined}
              showsVerticalScrollIndicator={showAllBidders}
            >
              {(showAllBidders ? data.top_bids : data.top_bids.slice(0, 4)).map(
                (bid, index) => (
                  <XStack
                    key={bid.id}
                    alignItems="center"
                    gap="$3"
                    px="$3"
                    py="$2.5"
                    backgroundColor="$background"
                    borderRadius="$3"
                    {...(index === 0 && {
                      backgroundColor: "$muted",
                      borderRadius: "$5",
                    })}
                    onPress={() => clickBidder(bid.bidder?.id || "")}
                  >
                    <Text
                      color={index === 0 ? "$foreground" : "$mutedForeground"}
                      fontSize={index === 0 ? "$6" : "$5"}
                      fontWeight={index === 0 ? "600" : "500"}
                      minWidth={20}
                    >
                      #{index + 1}
                    </Text>
                    <AvatarIcon url={bid.bidder?.profile_image_url} size="$5" />
                    <YStack flex={1}>
                      <Text
                        fontSize={index === 0 ? "$5" : "$4"}
                        fontWeight="500"
                        color="$foreground"
                      >
                        {bid.bidder?.username}
                      </Text>
                    </YStack>
                    <Text
                      fontSize={index === 0 ? "$5" : "$4"}
                      fontWeight="600"
                      color={index === 0 ? "$foreground" : "$mutedForeground"}
                    >
                      {currency} {bid.amount.toFixed(2)}
                    </Text>
                  </XStack>
                )
              )}
            </ScrollView>
          </YStack>
        )}

        {/* Action Buttons */}
        <YStack gap="$3" marginTop="$2">
          {!hasActiveSettlement ? (
            <Button
              variant="primary"
              size="lg"
              onPress={handleStartSettlement}
              disabled={settleTransaction.isPending}
            >
              {settleTransaction.isPending
                ? "Starting Settlement..."
                : "Contact Highest Bidder"}
            </Button>
          ) : (
            <Button
              variant={isExpired ? "destructive" : "secondary"}
              size="lg"
              onPress={handleMarkNoResponse}
              disabled={!isExpired || markNoResponse.isPending}
            >
              {markNoResponse.isPending
                ? "Marking No Response..."
                : isExpired
                ? "Mark as No Response"
                : `Mark as No Response`}
            </Button>
          )}
        </YStack>
      </YStack>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={["90%"]}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      enableDynamicSizing={true}
    >
      {renderContent()}
    </BottomSheet>
  );
});

SettlementBottomSheet.displayName = "SettlementBottomSheet";
