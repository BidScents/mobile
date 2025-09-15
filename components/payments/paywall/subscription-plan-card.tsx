import { ThemedIonicons } from "@/components/ui/themed-icons";
import type { SubscriptionPlan } from "@/types/products";
import { Text, XStack, YStack } from "tamagui";

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  isSelected: boolean;
  onSelect: () => void;
  hideFreeTrial?: boolean;
}

export function SubscriptionPlanCard({
  plan,
  isSelected,
  onSelect,
  hideFreeTrial = false,
}: SubscriptionPlanCardProps) {
  // Filter out free trial from features if hideFreeTrial is true
  const displayFeatures = hideFreeTrial 
    ? plan.features?.filter(feature => !feature.toLowerCase().includes('free trial')) || []
    : plan.features || [];

  return (
    <YStack
      backgroundColor="$muted"
      borderRadius="$6"
      padding="$4"
      onPress={onSelect}
      pressStyle={{
        scale: 0.99,
      }}
      position="relative"
      borderWidth={isSelected ? 2 : 0}
      borderColor="$foreground"
    >
      {plan.popular && (
        <XStack
          position="absolute"
          top={-8}
          right={12}
          backgroundColor="$foreground"
          paddingHorizontal="$2"
          paddingVertical="$1"
          borderRadius="$2"
          zIndex={1}
        >
          <Text fontSize="$1" color="$background" fontWeight="600">
            MOST POPULAR
          </Text>
        </XStack>
      )}

      <YStack gap="$3">
        {/* Header */}
        <XStack alignItems="center" justifyContent="space-between">
          <YStack gap="$1">
            <Text fontSize="$5" fontWeight="500" color="$foreground">
              {plan.title}
            </Text>
            <Text fontSize="$4" color="$mutedForeground">
              {plan.subtitle}
            </Text>
          </YStack>

          <XStack alignItems="baseline" gap="$1">
            <Text fontSize="$7" fontWeight="700" color="$foreground">
              {plan.price}
            </Text>
            <Text fontSize="$4" color="$mutedForeground">
              {plan.billing}
            </Text>
          </XStack>
        </XStack>

        {/* Features */}
        <YStack gap="$2">
          {displayFeatures.map((feature, index) => (
            <XStack key={index} alignItems="center" gap="$2">
              <ThemedIonicons
                name="checkmark-circle"
                size={16}
                themeColor="foreground"
              />
              <Text fontSize="$4" color="$foreground" flex={1}>
                {feature}
              </Text>
            </XStack>
          ))}
        </YStack>
      </YStack>
    </YStack>
  );
}