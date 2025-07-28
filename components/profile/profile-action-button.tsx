import React from 'react';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';

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
          disabled={isLoading}
          marginTop="$3"
          fullWidth
        >
          {isLoading ? "Loading..." : isFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </>
  );
};
