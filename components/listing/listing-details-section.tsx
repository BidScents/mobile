import { ListingDetails } from "@bid-scents/shared-sdk";
import { Text, XStack, YStack } from "tamagui";
import { formatAllCapsText } from "../../utils/utility-functions";

export function ListingDetailsSection({
  listing,
}: {
  listing: ListingDetails;
}) {
  const listingDetails = [
    {
      title: "Category",
      value: formatAllCapsText(listing?.category || ""),
    },
    {
      title: "Purchase Year",
      value: listing?.purchase_year,
    },
    {
      title: "Box Condition",
      value: formatAllCapsText(listing?.box_condition || ""),
    },
    {
      title: "Quantity",
      value: listing?.quantity,
    },
    {
      title: "Volume",
      value: listing?.volume,
    },
    {
      title: "Remaining Percentage",
      value: listing?.remaining_percentage,
    },
    {
      title: "Batch Code",
      value: listing?.batch_code ? listing?.batch_code : "N/A",
    },
  ];
  return (
    <YStack gap="$3">
      <Text fontSize="$7" fontWeight="500">
        Listing Details
      </Text>
      <YStack gap="$1" bg="$muted" borderRadius="$6" px="$4" py="$2">
        {listingDetails.map((detail) => (
          <XStack
            key={detail.title}
            alignItems="center"
            justifyContent="space-between"
            gap="$2"
            py="$2.5"
          >
            <Text fontSize="$5" fontWeight="500">
              {detail.title}
            </Text>
            <Text fontSize="$5" fontWeight="400">
              {detail.value}
            </Text>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}
