import { Button } from "@/components/ui/button";
import { router } from "expo-router";
import React from "react";
import { Animated } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";

interface ProfileHeaderProps {
  profile: {
    name: string;
    username: string;
    location?: string;
    joined_at: string;
    following_count: number;
    follower_count: number;
    average_rating?: number;
    bio?: string;
    is_following?: boolean;
  };
  isProfileOwner: boolean;
  scrollY: Animated.Value;
  onFollowToggle: () => void;
  isFollowLoading: boolean;
}

const HEADER_HEIGHT_EXPANDED = 35;

export const ProfileHeader = React.memo(function ProfileHeader({
  profile,
  isProfileOwner,
  scrollY,
  onFollowToggle,
  isFollowLoading
}: ProfileHeaderProps) {
  return (
    <View gap="$4" paddingHorizontal="$4" paddingTop="$4">
      {/* Profile Avatar */}
      <Animated.View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: "#e0e0e0",
          transform: [
            {
              scale: scrollY.interpolate({
                inputRange: [0, HEADER_HEIGHT_EXPANDED],
                outputRange: [1, 0.8],
                extrapolate: "clamp",
              }),
            },
            {
              translateY: scrollY.interpolate({
                inputRange: [0, HEADER_HEIGHT_EXPANDED],
                outputRange: [0, 16],
                extrapolate: "clamp",
              }),
            },
          ],
        }}
      />

      <View gap="$2">
        {/* Profile Info */}
        <View gap="$1">
          <Text fontWeight="500" fontSize="$7" color="$foreground">
            {profile.name}
          </Text>
          <Text fontWeight="500" fontSize="$5" color="$mutedForeground">
            @{profile.username}
          </Text>
        </View>

        <YStack gap="$1.5">
          {profile.location && (
            <Text fontSize="$5" color="$foreground">
              {profile.location}
            </Text>
          )}

          <Text fontSize="$5" color="$mutedForeground">
            Member since {new Date(profile.joined_at).getFullYear()}
          </Text>

          <XStack gap="$3">
            <Text fontWeight="bold" fontSize="$4" color="$foreground">
              {profile.following_count}{" "}
              <Text fontWeight="normal" color="$mutedForeground">
                Following
              </Text>
            </Text>
            <Text fontWeight="bold" fontSize="$4" color="$foreground">
              {profile.follower_count}{" "}
              <Text fontWeight="normal" color="$mutedForeground">
                Followers
              </Text>
            </Text>
          </XStack>
        </YStack>

        {/* Rating */}
        {profile.average_rating && profile.average_rating > 0 ? (
          <XStack alignItems="center" gap="$2">
            <Text fontWeight="bold" fontSize="$5" color="$foreground">
              {profile.average_rating.toFixed(1)}
            </Text>
            <Text fontSize="$4" color="$mutedForeground">
              ⭐ average rating
            </Text>
          </XStack>
        ) : (
          <Text fontSize="$5" color="$mutedForeground">
            No ratings yet
          </Text>
        )}

        {/* Bio */}
        {profile.bio && (
          <Text fontSize="$5" color="$foreground" lineHeight="$5">
            {profile.bio}
          </Text>
        )}

        {/* Action Button */}
        {isProfileOwner ? (
          <Button
            variant="secondary"
            onPress={() => router.push("/(tabs)")}
            marginTop="$3"
            fullWidth
          >
            Seller Dashboard
          </Button>
        ) : (
          <Button
            variant="secondary"
            onPress={onFollowToggle}
            disabled={isFollowLoading}
            marginTop="$3"
            fullWidth
          >
            {isFollowLoading
              ? "Loading..."
              : profile.is_following
              ? "Following"
              : "Follow"}
          </Button>
        )}
      </View>
    </View>
  );
});
