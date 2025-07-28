import React from 'react';
import { Text } from 'tamagui';

interface ProfileBioProps {
  bio?: string | null;
}

export const ProfileBio: React.FC<ProfileBioProps> = ({ bio }) => {
  if (!bio) return null;

  return (
    <Text fontSize="$5" color="$foreground" lineHeight="$5">
      {bio}
    </Text>
  );
};
