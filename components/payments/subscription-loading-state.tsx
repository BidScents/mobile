import { Container } from "@/components/ui/container";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { Spinner, Text, YStack } from "tamagui";

interface SubscriptionLoadingStateProps {
  type: "loading" | "error";
}

export function SubscriptionLoadingState({ type }: SubscriptionLoadingStateProps) {
  if (type === "loading") {
    return (
      <Container variant="padded" safeArea={false}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <Spinner size="large" color="$primary" />
          <Text fontSize="$5" color="$mutedForeground" textAlign="center">
            Loading subscription plans...
          </Text>
        </YStack>
      </Container>
    );
  }

  return (
    <Container variant="padded" safeArea={false}>
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
        <ThemedIonicons name="alert-circle" size={48} themeColor="error" />
        <Text fontSize="$5" fontWeight="500" color="$foreground" textAlign="center">
          Unable to Load Plans
        </Text>
        <Text fontSize="$5" color="$mutedForeground" textAlign="center">
          Please check your connection and try again
        </Text>
      </YStack>
    </Container>
  );
}