import { AuctionDetails } from "@bid-scents/shared-sdk";
import { YStack } from "tamagui";
import { AuctionDetailsSection } from "./auction-details";
import { AuctionHeader } from "./auction-header";
import { BiddingHistory } from "./bidding-history";
import { CountdownTicker } from "./countdown-ticker";

interface AuctionSectionProps {
  auctionDetails: AuctionDetails | null | undefined;
  isLive?: boolean;
  currentViewers?: number;
}

export function AuctionSection({ 
  auctionDetails,
  isLive = false,
  currentViewers
}: AuctionSectionProps) {
  return (
    <YStack gap="$4">
      <YStack gap="$1">
        <AuctionHeader status={auctionDetails?.status} />

        {auctionDetails?.ends_at && (
          <CountdownTicker endsAt={auctionDetails.ends_at} />
        )}

        <AuctionDetailsSection 
          auctionDetails={auctionDetails}
          isLive={isLive}
          currentViewers={currentViewers}
        />
      </YStack>

      <BiddingHistory auctionDetails={auctionDetails} />
    </YStack>
  );
}
