import { ThemedIonicons } from "@/components/ui/themed-icons";
import React from "react";
import { Text, View, XStack, YStack } from "tamagui";

const SafetyNote = ({ text }: { text: string }) => (
  <XStack alignItems="flex-start" gap="$2" marginBottom="$2">
    <Text fontSize="$4" color="$mutedForeground" flex={1} lineHeight="$2">
      {text}
    </Text>
  </XStack>
);

export function EmptyChatOnboarding() {
  return (
    <View flex={1} justifyContent="center" alignItems="center" padding="$4">
      <YStack maxWidth={320} width="100%" alignItems="center">
        {/* Header */}
        <View marginBottom="$4" alignItems="center" gap="$2">
          <ThemedIonicons name="chatbubble-ellipses-outline" size={42} color="$mutedForeground" />
          <Text fontSize="$5" fontWeight="600" color="$mutedForeground" marginBottom="$2">
            No messages yet
          </Text>
          <Text fontSize="$4" color="$mutedForeground" textAlign="center" marginBottom="$4">
            Start the conversation by sending a message
          </Text>
        </View>

        {/* Safety Notes */}
        <YStack width="100%" backgroundColor="$muted" borderRadius="$6" padding="$4" gap="$2">
          <XStack alignItems="center" gap="$2" marginBottom="$3">
            <ThemedIonicons name="shield-checkmark" size={20} color="$green10" />
            <Text fontSize="$4" fontWeight="600" color="$foreground">
              Safety Reminders
            </Text>
          </XStack>
          
          <SafetyNote text="Always ask for proof of purchase" />
          <SafetyNote text="Never share personal/banking information outside platform" />
        </YStack>
      </YStack>
    </View>
  );
}