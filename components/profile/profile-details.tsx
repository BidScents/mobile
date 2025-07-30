import React from "react";
import { View, XStack } from "tamagui";
import { ProfileActionButton } from "./profile-action-button";
import { ProfileBio } from "./profile-bio";
import { ProfileInfo } from "./profile-info";
import { ProfilePicture } from "./profile-picture";
import { ProfileRating } from "./profile-rating";
import { ProfileStats } from "./profile-stats";

interface ProfileDetailsProps {
  profile: {
    name: string;
    username: string;
    location?: string | null;
    joined_at: string;
    following_count: number;
    follower_count: number;
    average_rating?: number | null;
    bio?: string | null;
    profile_picture?: string | null;
    is_following?: boolean;
  };
  isProfileOwner: boolean;
  isFollowLoading: boolean;
  onFollowToggle: () => void;
}

export const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  profile,
  isProfileOwner,
  isFollowLoading,
  onFollowToggle,
}) => {
  return (
    <View paddingHorizontal="$4" mt="$4" gap="$4">
      <XStack alignItems="center" justifyContent="space-between">
        <View gap="$2">
          {/* Profile Info */}
          <ProfileInfo
            name={profile.name}
            username={profile.username}
            location={profile.location}
            joinedAt={profile.joined_at}
          />

          {/* Profile Stats */}
          <ProfileStats
            followingCount={profile.following_count}
            followerCount={profile.follower_count}
          />

          {/* Rating */}
          <ProfileRating averageRating={profile.average_rating} />
        </View>

        {/* Profile Picture */}
        <ProfilePicture
          profilePicture={profile.profile_picture}
        />
      </XStack>

      <View gap="$2">
        {/* Bio */}
        <ProfileBio bio={profile.bio} />

        {/* Action Button */}
        <ProfileActionButton
          isProfileOwner={isProfileOwner}
          isFollowing={profile.is_following}
          isLoading={isFollowLoading}
          onFollowToggle={onFollowToggle}
        />
      </View>
    </View>
  );
};
