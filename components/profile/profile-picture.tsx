import FastImage from '@d11/react-native-fast-image';
import React from 'react';
import { useThemeColors } from '../../hooks/use-theme-colors';

interface ProfilePictureProps {
  profilePicture?: string | null;
}

export const ProfilePicture: React.FC<ProfilePictureProps> = ({
  profilePicture,
}) => {
  const colors = useThemeColors();
  const hasValidUrl = profilePicture && profilePicture.trim() !== "";


  return (
    <FastImage
      source={hasValidUrl ? {
        uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${profilePicture}`,
      } : require('@/assets/images/image-placeholder.png')}
      style={{
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: colors.foreground,
      }}
      resizeMode={FastImage.resizeMode.cover}
    />
  );
};
