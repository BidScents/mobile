import { Button as ButtonUI } from "@/components/ui/button";
import { Text, XStack, YStack } from "tamagui";

interface SubscriptionManagementSectionProps {
  onUpgrade: () => void;
  onCancel: () => void;
  isCancelling: boolean;
}

export function SubscriptionManagementSection({
  onUpgrade,
  onCancel,
  isCancelling,
}: SubscriptionManagementSectionProps) {
  return (
    <YStack gap="$3">
      <Text fontSize="$5" fontWeight="500" color="$foreground">
        Manage Subscription
      </Text>
      <XStack borderRadius="$6" gap="$3">
        <ButtonUI
          variant="primary"
          onPress={onUpgrade}
          flex={1}
          size="md"
        >
          Change Plan
        </ButtonUI>

        <ButtonUI
          variant="destructive"
          onPress={onCancel}
          disabled={isCancelling}
          flex={1}
          size="md"
        >
          {isCancelling ? "Cancelling..." : "Cancel"}
        </ButtonUI>
      </XStack>
    </YStack>
  );
}