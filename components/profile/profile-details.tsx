import React from 'react';
import { View } from 'tamagui';
import { ProfilePicture } from './profile-picture';
import { ProfileInfo } from './profile-info';
import { ProfileStats } from './profile-stats';
import { ProfileRating } from './profile-rating';
import { ProfileBio } from './profile-bio';
import { ProfileActionButton } from './profile-action-button';
import { Animated } from 'react-native';

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
  scrollY: Animated.Value;
  headerHeightExpanded: number;
  isProfileOwner: boolean;
  isFollowLoading: boolean;
  onFollowToggle: () => void;
}

export const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  profile,
  scrollY,
  headerHeightExpanded,
  isProfileOwner,
  isFollowLoading,
  onFollowToggle,
}) => {
  return (
    <View paddingHorizontal="$4">
      {/* Profile Picture */}
      <ProfilePicture
        profilePicture={profile.profile_picture}
        scrollY={scrollY}
        headerHeightExpanded={headerHeightExpanded}
      />

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
