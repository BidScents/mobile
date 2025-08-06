import { Text, XStack } from "tamagui";
import { AuctionStatus } from "./auction-status";

interface AuctionHeaderProps {
  status?: string;
}

export function AuctionHeader({ status }: AuctionHeaderProps) {
  return (
    <XStack alignItems="center" justifyContent="space-between">
      <Text fontSize="$8" fontWeight="600" color="$foreground">
        Auction Details
      </Text>

      {status && <AuctionStatus status={status} />}
    </XStack>
  );
}
