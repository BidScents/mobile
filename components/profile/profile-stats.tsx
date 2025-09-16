import React from 'react';
import { Pressable } from 'react-native';
import { Text, XStack } from 'tamagui';

interface ProfileStatsProps {
  followingCount: number;
  followerCount: number;
  onFollowingPress?: () => void;
  onFollowersPress?: () => void;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  followingCount,
  followerCount,
  onFollowingPress,
  onFollowersPress,
}) => {
  return (
    <XStack gap="$3">
      <Pressable
        onPress={onFollowingPress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text fontWeight="bold" fontSize="$4" color="$foreground">
          {followingCount}{" "}
          <Text fontWeight="normal" color="$mutedForeground">
            Following
          </Text>
        </Text>
      </Pressable>
      <Pressable
        onPress={onFollowersPress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text fontWeight="bold" fontSize="$4" color="$foreground">
          {followerCount}{" "}
          <Text fontWeight="normal" color="$mutedForeground">
            Followers
          </Text>
        </Text>
      </Pressable>
    </XStack>
  );
};
