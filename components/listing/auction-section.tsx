import { currency } from "@/constants/constants";
import { AuctionDetails } from "@bid-scents/shared-sdk";
import { router } from "expo-router";
import { useState } from "react";
import { Text, View, XStack, YStack } from "tamagui";
import { formatDate } from "../../utils/utility-functions";
import { AvatarIcon } from "../ui/avatar-icon";
import { Button } from "../ui/button";

export function AuctionSection({
  auctionDetails,
}: {
  auctionDetails: AuctionDetails | null | undefined;
}) {
  const [visibleBidsCount, setVisibleBidsCount] = useState(3);

  const listingDetails = [
    {
      title: "Starting Price",
      value: auctionDetails?.starting_price,
    },
    {
      title: "Reserve Price",
      value: 0,
    },
    {
      title: "Buy Now Price",
      value: auctionDetails?.buy_now_price,
    },
    {
      title: "Current Bid",
      value: 0,
    },
    {
      title: "Total Bids",
      value: auctionDetails?.bid_count,
    },
  ];

    auctionDetails?.bids?.push(
      {
        id: "1",
        bidder: {
          id: "user1",
          username: "john_doe",
          profile_image_url: "https://i.pravatar.cc/150?img=1"
        },
        amount: 150,
        created_at: "2025-01-06T17:30:00Z"
      },
      {
        id: "2",
        bidder: {
          id: "user2",
          username: "sarah_smith",
          profile_image_url: "https://i.pravatar.cc/150?img=2"
        },
        amount: 175,
        created_at: "2025-01-06T17:45:00Z"
      },
      {
        id: "3",
        bidder: {
          id: "user3",
          username: "mike_wilson",
          profile_image_url: "https://i.pravatar.cc/150?img=3"
        },
        amount: 200,
        created_at: "2025-01-06T18:00:00Z"
      },
      {
        id: "4",
        bidder: {
          id: "user4",
          username: "emma_brown",
          profile_image_url: "https://i.pravatar.cc/150?img=4"
        },
        amount: 225,
        created_at: "2025-01-06T18:15:00Z"
      },
      {
        id: "5",
        bidder: {
          id: "user5",
          username: "alex_johnson",
          profile_image_url: "https://i.pravatar.cc/150?img=5"
        },
        amount: 250,
        created_at: "2025-01-06T18:30:00Z"
      },
      {
        id: "6",
        bidder: {
          id: "user6",
          username: "lisa_davis",
          profile_image_url: "https://i.pravatar.cc/150?img=6"
        },
        amount: 275,
        created_at: "2025-01-06T18:45:00Z"
      },
      {
        id: "7",
        bidder: {
          id: "user7",
          username: "david_garcia",
          profile_image_url: "https://i.pravatar.cc/150?img=7"
        },
        amount: 300,
        created_at: "2025-01-06T19:00:00Z"
      }
    );

  console.log("Auction Details", auctionDetails);

  // Get the bids to display based on visible count
  const visibleBids = auctionDetails?.bids?.slice(0, visibleBidsCount) || [];
  const hasMoreBids = (auctionDetails?.bids?.length || 0) > visibleBidsCount;

  const handleShowMoreBids = () => {
    setVisibleBidsCount((prev) => prev + 5);
  };

  console.log("Auction Details", auctionDetails);
  return (
    <YStack gap="$4">
      <YStack gap="$1">
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize="$8" fontWeight="600" color="$foreground">
            Auction Details
          </Text>

          <XStack
            alignItems="center"
            gap="$2"
            backgroundColor="$muted"
            borderRadius="$5"
            py="$2"
            px="$3"
          >
            <Text fontSize="$5" fontWeight="500" color="$foreground">
              {auctionDetails?.status}
            </Text>
          </XStack>
        </XStack>
        <YStack gap="$1" borderRadius="$6">
          {listingDetails.map((detail) => (
            <XStack
              key={detail.title}
              alignItems="center"
              justifyContent="space-between"
              gap="$2"
              py="$3.5"
              borderBottomWidth="$1"
              borderBottomColor="$muted"
            >
              <Text fontSize="$5" fontWeight="500">
                {detail.title}
              </Text>

              <XStack alignItems="center" gap="$3">
                <Text fontSize="$5" fontWeight="400">
                  {detail.value}
                </Text>
                {/* <Ionicons name="chevron-forward" size={20} color={theme.foreground?.val} /> */}
              </XStack>
            </XStack>
          ))}
        </YStack>
      </YStack>
      <YStack gap="$3">
        <Text fontSize="$8" fontWeight="600" color="$foreground">
          Bidding History
        </Text>

        {/* Bids List */}
        {auctionDetails?.bids?.length ? (
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
                    <Text
                      fontSize="$5"
                      fontWeight="500"
                      numberOfLines={1}
                    >
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
        ) : (
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
        )}
      </YStack>
    </YStack>
  );
}
