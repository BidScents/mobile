import React from 'react';
import { Animated } from 'react-native';
import { useTheme } from 'tamagui';

interface ProfilePictureProps {
  profilePicture?: string | null;
  scrollY: Animated.Value;
  headerHeightExpanded: number;
}

export const ProfilePicture: React.FC<ProfilePictureProps> = ({
  profilePicture,
  scrollY,
  headerHeightExpanded,
}) => {
  const theme = useTheme();

  return (
    <Animated.Image
      source={{
        uri: profilePicture || "https://avatar.iran.liara.run/public",
      }}
      style={{
        marginBottom: 10,
        width: 75,
        height: 75,
        borderRadius: 40,
        borderWidth: 4,
        marginTop: -30,
        borderColor: theme.foreground?.val,
        transform: [
          {
            scale: scrollY.interpolate({
              inputRange: [0, headerHeightExpanded],
              outputRange: [1, 0.6],
              extrapolate: "clamp",
            }),
          },
          {
            translateY: scrollY.interpolate({
              inputRange: [0, headerHeightExpanded],
              outputRange: [0, 16],
              extrapolate: "clamp",
            }),
          },
        ],
      }}
    />
  );
};
