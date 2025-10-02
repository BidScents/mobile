import { ThemedIonicons } from "@/components/ui/themed-icons";
import React from "react";
import { Text, YStack } from "tamagui";

export interface EmptyUserListStateProps {
  iconName: string;
  title: string;
  description: string;
}

export const EmptyUserListState = React.memo<EmptyUserListStateProps>(({ 
  iconName, 
  title, 
  description 
}) => (
  <YStack alignItems="center" justifyContent="center" padding="$6" gap="$3">
    <ThemedIonicons
      name={iconName as any}
      size={48}
      color="$mutedForeground"
    />
    <Text fontSize="$6" fontWeight="600" color="$foreground" textAlign="center">
      {title}
    </Text>
    <Text fontSize="$4" color="$mutedForeground" textAlign="center">
      {description}
    </Text>
  </YStack>
));

EmptyUserListState.displayName = "EmptyUserListState";