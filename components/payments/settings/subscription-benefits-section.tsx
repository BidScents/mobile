import { Text, XStack, YStack } from "tamagui";

interface SubscriptionBenefitsSectionProps {
  boostCredits: Record<string, number>;
}

export function SubscriptionBenefitsSection({
  boostCredits,
}: SubscriptionBenefitsSectionProps) {
  return (
    <YStack gap="$3">
      <Text fontSize="$5" fontWeight="500" color="$foreground">
        Your Benefits
      </Text>
      <YStack backgroundColor="$muted" borderRadius="$6" px="$4" py="$4" gap="$3">
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize="$4" fontWeight="500" color="$foreground">
            Normal credits
          </Text>
          <Text fontSize="$4" color="$foreground">
            {(boostCredits as any)?.normal_boost || 0}
          </Text>
        </XStack>

        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize="$4" fontWeight="500" color="$foreground">
            Premium credits
          </Text>
          <Text fontSize="$4" color="$foreground">
            {(boostCredits as any)?.premium_boost || 0}
          </Text>
        </XStack>
      </YStack>
    </YStack>
  );
}