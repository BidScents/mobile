import React from 'react';
import { Text, XStack } from 'tamagui';

interface ProfileStatsProps {
  followingCount: number;
  followerCount: number;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  followingCount,
  followerCount,
}) => {
  return (
    <XStack gap="$3">
      <Text fontWeight="bold" fontSize="$4" color="$foreground">
        {followingCount}{" "}
        <Text fontWeight="normal" color="$mutedForeground">
          Following
        </Text>
      </Text>
      <Text fontWeight="bold" fontSize="$4" color="$foreground">
        {followerCount}{" "}
        <Text fontWeight="normal" color="$mutedForeground">
          Followers
        </Text>
      </Text>
    </XStack>
  );
};
