import { Container } from "@/components/ui/container";
import { Spinner, Text, YStack } from "tamagui";

export function PaymentsLoadingState() {
  return (
    <Container>
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
        <Spinner size="large" color="$primary" />
        <Text fontSize="$5" color="$mutedForeground">
          Loading subscription details...
        </Text>
      </YStack>
    </Container>
  );
}