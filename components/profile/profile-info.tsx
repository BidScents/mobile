import React from 'react';
import { Text, View, YStack } from 'tamagui';

interface ProfileInfoProps {
  name: string;
  username: string;
  location?: string | null;
  joinedAt: string;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({
  name,
  username,
  location,
  joinedAt,
}) => {
  return (
    <View gap="$2">
      {/* Profile Info */}
      <View gap="$1">
        <Text fontWeight="500" fontSize="$7" color="$foreground">
          {name}
        </Text>
        <Text fontWeight="500" fontSize="$5" color="$mutedForeground">
          @{username}
        </Text>
      </View>

      <YStack gap="$1.5">
        {location && (
          <Text fontSize="$5" color="$foreground">
            {location}
          </Text>
        )}

        <Text fontSize="$5" color="$mutedForeground">
          Member since {new Date(joinedAt).getFullYear()}
        </Text>
      </YStack>
    </View>
  );
};
