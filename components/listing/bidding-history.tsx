import { currency } from "@/constants/constants";
import { AuctionDetails } from "@bid-scents/shared-sdk";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View, XStack, YStack } from "tamagui";
import { formatDate } from "../../utils/utility-functions";
import { AvatarIcon } from "../ui/avatar-icon";
import { Button } from "../ui/button";

interface BiddingHistoryProps {
  auctionDetails: AuctionDetails | null | undefined;
}

export function BiddingHistory({ auctionDetails }: BiddingHistoryProps) {
  const [visibleBidsCount, setVisibleBidsCount] = useState(3);

  // Get the bids to display based on visible count
  const visibleBids = auctionDetails?.bids?.slice(0, visibleBidsCount) || [];
  const hasMoreBids = (auctionDetails?.bids?.length || 0) > visibleBidsCount;

  const handleShowMoreBids = () => {
    setVisibleBidsCount((prev) => prev + 5);
  };

  if (!auctionDetails?.bids?.length) {
    return (
      <YStack gap="$3">
        <Text fontSize="$8" fontWeight="600" color="$foreground">
          Bidding History
        </Text>

        <View
          padding="$6"
          borderRadius="$4"
          alignItems="center"
          justifyContent="center"
        >
          <Text
            fontSize="$5"
            fontWeight="600"
            color="$mutedForeground"
            textAlign="center"
            marginBottom="$2"
          >
            No Bids Yet
          </Text>
          <Text fontSize="$3" color="$mutedForeground" textAlign="center">
            Be the first to place a bid on this listing.
          </Text>
        </View>
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      <Text fontSize="$8" fontWeight="600" color="$foreground">
        Bidding History
      </Text>

      <YStack gap="$3">
        {visibleBids.map((bid) => (
          <XStack
            key={bid.id}
            gap="$3"
            width="100%"
            px="$3"
            py="$2.5"
            borderRadius="$6"
            borderWidth="$1"
            borderColor="$mutedForeground"
            justifyContent="space-between"
            alignItems="center"
          >
            <XStack gap="$3">
              <AvatarIcon
                url={bid.bidder?.profile_image_url}
                size="$4"
                onClick={() => router.push(`/profile/${bid.bidder?.id}`)}
              />

              <YStack gap="$1" alignItems="flex-start" justifyContent="center">
                <Text fontSize="$5" fontWeight="500" numberOfLines={1}>
                  {bid.bidder?.username}
                </Text>

                <Text fontSize="$3" color="$mutedForeground">
                  {formatDate(bid.created_at)}
                </Text>
              </YStack>
            </XStack>

            {/* Bid Amount */}
            <View
              px="$3"
              py="$2"
              backgroundColor="$muted"
              borderRadius="$5"
              borderColor="$mutedForeground"
              justifyContent="center"
              alignItems="center"
            >
              <Text fontSize="$4" fontWeight="600" color="$foreground">
                {currency} {bid.amount}
              </Text>
            </View>
          </XStack>
        ))}

        {/* Show More Button */}
        {hasMoreBids && (
          <View alignItems="center" flex={1}>
            <Button
              variant="secondary"
              size="md"
              onPress={handleShowMoreBids}
              fullWidth
            >
              <Text fontSize="$3" fontWeight="500" color="$foreground">
                Show More Bids
              </Text>
            </Button>
          </View>
        )}
      </YStack>
    </YStack>
  );
}
