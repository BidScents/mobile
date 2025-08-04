import { AuctionDetails } from "@bid-scents/shared-sdk";
import { Text } from "tamagui";

export function AuctionSection({ auctionDetails }: { auctionDetails: AuctionDetails | null | undefined }) {
    return (
        <Text>{auctionDetails}</Text>
    )
}