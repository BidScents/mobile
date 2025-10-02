import { ThemedIonicons } from '@/components/ui/themed-icons';
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
          <Text fontWeight="600" fontSize="$5" color="$foreground">
            {averageRating.toFixed(1)}
          </Text>
          <XStack alignItems="center" gap="$1.5">
            <ThemedIonicons 
              name="star" 
              size={16} 
              themeColor="rating" 
            />
            <Text fontSize="$4" fontWeight="500" color="$mutedForeground">
              Average rating
            </Text>
          </XStack>
        </XStack>
      ) : (
        <XStack alignItems="center" gap="$1.5">
          <ThemedIonicons 
            name="star-outline" 
            size={16} 
            themeColor="muted" 
          />
          <Text fontSize="$4" fontWeight="500" color="$mutedForeground">
            No ratings yet
          </Text>
        </XStack>
      )}
    </>
  );
};
