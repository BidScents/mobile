import { Button as ButtonUI } from "@/components/ui/button";
import { Text, XStack, YStack } from "tamagui";

interface SubscriptionStatusSectionProps {
  isActive: boolean;
  planType: string | null;
  swapAccessUntil: Date | null;
  onUpgrade: () => void;
}

export function SubscriptionStatusSection({
  isActive,
  planType,
  swapAccessUntil,
  onUpgrade,
}: SubscriptionStatusSectionProps) {
  if (isActive) {
    return (
      <YStack gap="$3">
        <Text fontSize="$5" fontWeight="500" color="$foreground">
          Active Subscription
        </Text>
        <YStack backgroundColor="$muted" borderRadius="$6" px="$4" py="$4" gap="$3">
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize="$4" fontWeight="500" color="$foreground">
              Plan
            </Text>
            <Text fontSize="$4" color="$foreground">
              {planType || "Swap Pass"}
            </Text>
          </XStack>

          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize="$4" fontWeight="500" color="$foreground">
              Expires
            </Text>
            <Text fontSize="$4" color="$foreground">
              {swapAccessUntil?.toLocaleDateString() || "N/A"}
            </Text>
          </XStack>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      <Text fontSize="$5" fontWeight="500" color="$foreground">
        No Active Subscription
      </Text>
      <YStack backgroundColor="$muted" borderRadius="$6" px="$4" py="$4" gap="$3">
        <Text fontSize="$4" color="$mutedForeground">
          Subscribe to access swap listings and get boost credits for your
          listings.
        </Text>

        <ButtonUI
          variant="primary"
          onPress={onUpgrade}
        >
          Choose Plan
        </ButtonUI>
      </YStack>
    </YStack>
  );
}