import { AvatarIcon } from "@/components/ui/avatar-icon";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { UserPreview } from "@bid-scents/shared-sdk";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { Text, XStack, YStack } from "tamagui";

export interface UserCardProps {
  user: UserPreview;
}

export const UserCard = React.memo<UserCardProps>(({ user }) => {
  const handlePress = useCallback(() => {
    router.replace(`/profile/${user.id}`);
  }, [user.id]);

  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      bg="$muted"
      borderRadius="$6"
      px="$4"
      py="$3"
      onPress={handlePress}
      pressStyle={{
        backgroundColor: "$mutedPress",
      }}
    >
      <XStack alignItems="center" gap="$3">
        <AvatarIcon url={user.profile_image_url} size="$5" />

        <YStack alignSelf="center" gap="$1">
          <Text fontSize="$5" fontWeight="500">
            @{user.username}
          </Text>
          <Text fontSize="$4" fontWeight="400" color="$mutedForeground">
            View profile
          </Text>
        </YStack>
      </XStack>
      <ThemedIonicons name="chevron-forward" size={20} />
    </XStack>
  );
});

UserCard.displayName = "UserCard";