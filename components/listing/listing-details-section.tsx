import { ListingDetails } from "@bid-scents/shared-sdk";
import { Text, XStack, YStack } from "tamagui";


export function ListingDetailsSection({ listing }: { listing: ListingDetails }) {

      const listingDetails = [
        {
          "title": "Category",
          "value": listing?.category,
        },
        {
          "title": "Purchase Year",
          "value": listing?.purchase_year, 
        },
        {
          "title": "Box Condition",
          "value": listing?.box_condition,
        },
        {
          "title": "Quantity",
          "value": listing?.quantity,
        },
        {
          "title": "Volume",
          "value": listing?.volume,
        },
        {
          "title": "Remaining Percentage",
          "value": listing?.remaining_percentage,
        },
        {
          "title": "Batch Code",
          "value": listing?.batch_code ? listing?.batch_code : "N/A",
        },
      ]
    return (
        <YStack gap="$2">
            <Text fontSize="$7" fontWeight="500">Details</Text>
            <YStack gap="$1" bg="$muted" borderRadius="$6" px="$4" py="$2">
                {listingDetails.map((detail) => (
                <XStack key={detail.title} alignItems="center" justifyContent="space-between" gap="$2" py="$3">
                    <Text fontSize="$4" fontWeight="500">{detail.title}</Text>
                    <Text fontSize="$4" fontWeight="400">{detail.value}</Text>
                </XStack>
            ))}
            </YStack>
        </YStack>
    )
}