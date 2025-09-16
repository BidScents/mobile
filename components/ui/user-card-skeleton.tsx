import React from "react";
import { View, XStack, YStack } from "tamagui";

export const UserCardSkeleton = React.memo(() => (
  <XStack
    alignItems="center"
    justifyContent="space-between"
    bg="$muted"
    borderRadius="$6"
    px="$4"
    py="$3"
  >
    <XStack alignItems="center" gap="$3">
      <View
        width="$5"
        height="$5"
        borderRadius="$12"
        backgroundColor="$mutedForeground"
        opacity={0.3}
      />
      <YStack gap="$1">
        <View
          width={120}
          height={16}
          borderRadius="$2"
          backgroundColor="$mutedForeground"
          opacity={0.3}
        />
        <View
          width={80}
          height={12}
          borderRadius="$2"
          backgroundColor="$mutedForeground"
          opacity={0.3}
        />
      </YStack>
    </XStack>
    <View
      width={20}
      height={20}
      borderRadius="$2"
      backgroundColor="$mutedForeground"
      opacity={0.3}
    />
  </XStack>
));

UserCardSkeleton.displayName = "UserCardSkeleton";