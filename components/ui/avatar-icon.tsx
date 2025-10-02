import FastImage from '@d11/react-native-fast-image';
import React from 'react';
import { Pressable, View } from 'react-native';

// Map Tamagui size tokens to pixel values
const getSizeInPixels = (size: string): number => {
  switch (size) {
    case '$4': return 32;
    case '$5': return 40;
    case '$6': return 48;
    case '$7': return 56;
    default: return 40; // Default to $5 equivalent
  }
};

export function AvatarIcon({
  url,
  size,
  onClick,
  isGroup = false,
}: {
  url: string | null | undefined;
  size: string;
  onClick?: () => void;
  isGroup?: boolean;
}) {
  const sizeInPixels = getSizeInPixels(size);

  const containerStyle = {
    width: sizeInPixels,
    height: sizeInPixels,
    borderRadius: sizeInPixels / 2,
    overflow: 'hidden' as const,
  };

  const fallbackSource = require('@/assets/images/image-placeholder.png');
  const hasValidUrl = url && url.trim() !== "";

  const content = (
    <FastImage
      source={hasValidUrl ? {
        uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${url}`,
        priority: FastImage.priority.normal,
      } : fallbackSource}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
      resizeMode={FastImage.resizeMode.cover}
    />
  );

  if (onClick) {
    return (
      <Pressable onPress={onClick} style={containerStyle}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={containerStyle}>
      {content}
    </View>
  );
}
