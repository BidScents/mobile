import { ListingType } from "@bid-scents/shared-sdk";
import { Text, View } from "tamagui";
import { currency } from "@/constants/constants";

interface ListingHeaderProps {
  name: string;
  brand: string;
  price: number;
  listingType: ListingType;
}

/**
 * Listing header component displaying name, brand, and price
 * Handles different pricing logic for auction vs fixed price listings
 */
export function ListingHeader({ name, brand, price, listingType }: ListingHeaderProps) {
  const displayPrice = 
    listingType === ListingType.FIXED_PRICE || listingType === ListingType.NEGOTIABLE
      ? price
      : listingType;

  return (
    <View gap="$3">
      <View>
        <Text
          fontSize="$8"
          fontWeight="600"
          color="$foreground"
          lineHeight="$8"
        >
          {name}
        </Text>
        <Text
          fontSize="$4"
          fontWeight="400"
          color="$mutedForeground"
          marginTop="$1"
        >
          {brand}
        </Text>
      </View>

      <Text fontSize="$7" fontWeight="600" color="$foreground">
        {currency}{displayPrice}
      </Text>
    </View>
  );
}