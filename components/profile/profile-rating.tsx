import React from 'react';
import { Text, XStack } from 'tamagui';

interface ProfileRatingProps {
  averageRating?: number | null;
}

export const ProfileRating: React.FC<ProfileRatingProps> = ({
  averageRating,
}) => {
  return (
    <>
      {averageRating && averageRating > 0 ? (
        <XStack alignItems="center" gap="$2">
          <Text fontWeight="bold" fontSize="$5" color="$foreground">
            {averageRating.toFixed(1)}
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
    </>
  );
};
