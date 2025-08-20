import React from 'react';
import { Image } from 'react-native';
import { useTheme } from 'tamagui';

interface ProfilePictureProps {
  profilePicture?: string | null;
}

export const ProfilePicture: React.FC<ProfilePictureProps> = ({
  profilePicture,
}) => {
  const theme = useTheme();

  return (
    <Image
      source={{
        uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${profilePicture}` || "https://avatar.iran.liara.run/public",
      }}
      style={{
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: theme.foreground?.get(),
      }}
    />
  );
};
