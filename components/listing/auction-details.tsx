import { AuctionDetails } from "@bid-scents/shared-sdk";
import { Text, XStack, YStack } from "tamagui";

interface AuctionDetailsProps {
  auctionDetails: AuctionDetails | null | undefined;
}

interface DetailItem {
  title: string;
  value: number | null | undefined;
}

export function AuctionDetailsSection({ auctionDetails }: AuctionDetailsProps) {
  const listingDetails: DetailItem[] = [
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

  return (
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
          </XStack>
        </XStack>
      ))}
    </YStack>
  );
}
