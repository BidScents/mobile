import { ThemedIonicons } from "@/components/ui/themed-icons";
import { Text, XStack, YStack } from "tamagui";

export function SubscriptionHeader() {
  return (
    <>
      {/* Header Title */}
      <YStack alignItems="center">
        <Text
          fontSize="$8"
          fontWeight="600"
          color="$foreground"
          textAlign="center"
          lineHeight="$8"
        >
          Swap exclusive fragrances and promote your listings
        </Text>
      </YStack>

      {/* Benefits Section */}
      <YStack alignItems="center">
        <YStack gap="$2" width="100%" maxWidth={300}>
          <XStack alignItems="center" gap="$3">
            <ThemedIonicons name="swap-horizontal" size={24} color="$foreground" />
            <Text fontSize="$4" color="$foreground" flex={1}>
              Access to exclusive swap listings
            </Text>
          </XStack>
          <XStack alignItems="center" gap="$3">
            <ThemedIonicons name="trending-up" size={24} color="$foreground" />
            <Text fontSize="$4" color="$foreground" flex={1}>
              Boost credits to promote your listings
            </Text>
          </XStack>
        </YStack>
      </YStack>
    </>
  );
}