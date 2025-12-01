import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import React from 'react';

interface ProfileActionButtonProps {
  isProfileOwner: boolean;
  isFollowing?: boolean;
  isLoading: boolean;
  onFollowToggle: () => void;
}

export const ProfileActionButton: React.FC<ProfileActionButtonProps> = ({
  isProfileOwner,
  isFollowing,
  isLoading,
  onFollowToggle,
}) => {
  return (
    <>
      {isProfileOwner ? (
        <Button
          variant="secondary"
          onPress={() => router.replace("/(tabs)/profile/seller-dashboard")}
          marginTop="$3"
          borderRadius="$6"
          fullWidth
        >
          Seller Dashboard
        </Button>
      ) : (
        <Button
          variant="secondary"
          onPress={onFollowToggle}
          disabled={isLoading}
          marginTop="$3"
          borderRadius="$6"
          fullWidth
        >
          {isLoading ? "Loading..." : isFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </>
  );
};
