import { ThemedIonicons } from "@/components/ui/themed-icons";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Text, XStack, YStack } from "tamagui";

const PROTECTION_POINTS = [
  "Payment via BidScents secure buyer protection services",
  "Refund within 7 working days if found fake/scams",
  "BidScents protect both sides, any buyer or seller found trying to scam will get banned immediately",
];

export function BuyerProtectionCard() {
  const router = useRouter();

  const handleLearnMore = useCallback(() => {
    router.push("/profile/help");
  }, [router]);

  return (
    <YStack backgroundColor="$muted" borderRadius="$6" padding="$4" gap="$4">
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontSize="$6" fontWeight="500" color="$foreground">
          BidScents Buyer Protection
        </Text>
        <ThemedIonicons
          name="shield-checkmark-outline"
          size={24}
          color="$foreground"
        />
      </XStack>

      <YStack gap="$3">
        {PROTECTION_POINTS.map((point) => (
          <XStack key={point} alignItems="center" gap="$2">
            <YStack>
              <ThemedIonicons
                name="checkmark-circle"
                size={18}
                color="$mutedForeground"
              />
            </YStack>
            <Text
              flex={1}
              fontSize="$5"
              fontWeight="400"
              color="$foreground"
              lineHeight="$6"
            >
              {point}
            </Text>
          </XStack>
        ))}
      </YStack>

      <Text
        color="$mutedForeground"
        fontSize="$4"
        textDecorationLine="underline"
        onPress={handleLearnMore}
        pressStyle={{ opacity: 0.8 }}
      >
        Learn more about buyer protection
      </Text>
    </YStack>
  );
}
