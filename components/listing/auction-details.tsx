import { AuctionDetails } from "@bid-scents/shared-sdk";
import { Circle, Text, XStack, YStack } from "tamagui";

interface AuctionDetailsProps {
  auctionDetails: AuctionDetails | null | undefined;
  isLive?: boolean;
  currentViewers?: number;
}

interface DetailItem {
  title: string;
  value: number | null | undefined;
}

export function AuctionDetailsSection({
  auctionDetails,
  isLive = false,
  currentViewers,
}: AuctionDetailsProps) {
  const listingDetails: DetailItem[] = [
    {
      title: "Starting Price",
      value: auctionDetails?.starting_price,
    },
    {
      title: "Buy Now Price",
      value: auctionDetails?.buy_now_price,
    },
    {
      title: "Current Bid",
      value:
        auctionDetails?.bids && auctionDetails.bids.length > 0
          ? auctionDetails.bids[0].amount
          : auctionDetails?.starting_price,
    },
    {
      title: "Total Bids",
      value: Math.max(
        auctionDetails?.bids?.length || 0,
        auctionDetails?.bid_count || 0
      ),
    },
  ];

  return (
    <YStack gap="$1" borderRadius="$6">
      {/* Live indicator and viewer count */}
      {isLive && (
        <XStack
          alignItems="center"
          justifyContent="space-between"
          gap="$2"
          py="$3.5"
          borderBottomWidth="$1"
          borderBottomColor="$muted"
        >
          <XStack alignItems="center" gap="$2">
            <Circle size={8} backgroundColor="$red10" />
            <Text fontSize="$5" fontWeight="500" color="$red10">
              Live Auction
            </Text>
          </XStack>
          <Text fontSize="$5" fontWeight="400" color="$foreground">
            {currentViewers !== undefined
              ? `${currentViewers} watching`
              : "0 watching"}
          </Text>
        </XStack>
      )}

      {listingDetails.map((detail) => (
        detail.value !== undefined && (
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
          </XStack>
        </XStack>
        )
      ))}
    </YStack>
  );
}
