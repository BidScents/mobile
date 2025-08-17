import { ListingDetails } from "@bid-scents/shared-sdk";
import { Text, XStack, YStack, useTheme } from "tamagui";
import { formatAllCapsText } from "../../utils/utility-functions";

export function ListingDetailsSection({
  listing,
}: {
  listing: ListingDetails;
}) {
  const theme = useTheme();
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
    <YStack gap="$1" bg="$muted" borderRadius="$6" px="$4" py="$2">
      {listingDetails.map((detail) => (
        <XStack
          key={detail.title}
          alignItems="center"
          justifyContent="space-between"
          gap="$2"
          py="$3"
        >
          <Text fontSize="$5" fontWeight="500">
            {detail.title}
          </Text>

          <XStack alignItems="center" gap="$3">
            <Text fontSize="$5" fontWeight="400">
              {detail.value}
            </Text>
            {/* <Ionicons name="chevron-forward" size={20} color={theme.foreground?.get()} /> */}
          </XStack>
        </XStack>
      ))}
    </YStack>
  );
}
