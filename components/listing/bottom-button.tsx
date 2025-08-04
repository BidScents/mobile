import { Button } from "@/components/ui/button";
import { ListingType } from "@bid-scents/shared-sdk";
import { View } from "tamagui";

export default function BottomButton({
  listingType,
  isLoading,
  auctionPress,
  onPress,
}: {
  listingType: ListingType;
  isLoading?: boolean;
  auctionPress?: () => void;
  onPress?: () => void;
}) {
  return (
    <View
      paddingHorizontal="$4"
      paddingBottom="$4"
      backgroundColor="transparent"
      position="absolute"
      bottom={0}
      left={0}
      right={0}
    >
      {listingType === ListingType.AUCTION ? (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={auctionPress}
          disabled={isLoading}
          borderRadius="$10"
        >
          {isLoading ? "Loading..." : "Bid Now"}
        </Button>
      ) : (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={onPress}
          disabled={isLoading}
          borderRadius="$10"
        >
          {isLoading ? "Loading..." : "Contact Seller"}
        </Button>
      )}
    </View>
  );
}
