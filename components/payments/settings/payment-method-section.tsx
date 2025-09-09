import { Button as ButtonUI } from "@/components/ui/button";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { router } from "expo-router";
import { Text, XStack, YStack } from "tamagui";

interface PaymentMethodSectionProps {
  hasPaymentMethod: boolean;
}

export function PaymentMethodSection({ hasPaymentMethod }: PaymentMethodSectionProps) {
  return (
    <YStack gap="$3">
      <Text fontSize="$5" fontWeight="500" color="$foreground">
        Payment Method
      </Text>
      <YStack backgroundColor="$muted" borderRadius="$6" px="$4" py="$4">
        {hasPaymentMethod ? (
          <XStack alignItems="center" gap="$3">
            <ThemedIonicons
              name="card-outline"
              size={20}
              themeColor="foreground"
            />
            <YStack flex={1}>
              <Text fontSize="$4" color="$foreground">
                Payment method on file
              </Text>
              <Text fontSize="$3" color="$mutedForeground">
                Card details will be available soon
              </Text>
            </YStack>
            <ButtonUI size="sm" variant="outline" disabled>
              Update
            </ButtonUI>
          </XStack>
        ) : (
          <XStack alignItems="center" gap="$3">
            <ThemedIonicons
              name="card-outline"
              size={20}
              color="$mutedForeground"
            />
            <YStack flex={1}>
              <Text fontSize="$4" color="$mutedForeground">
                No payment method
              </Text>
              <Text fontSize="$3" color="$mutedForeground">
                Add a payment method to subscribe
              </Text>
            </YStack>
            <ButtonUI
              size="sm"
              variant="outline"
              onPress={() => router.push("/(screens)/subscription-paywall")}
            >
              Add
            </ButtonUI>
          </XStack>
        )}
      </YStack>
    </YStack>
  );
}