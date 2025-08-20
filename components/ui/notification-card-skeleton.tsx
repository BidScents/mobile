import React from "react";
import ContentLoader, { Rect } from "react-content-loader/native";
import { useColorScheme } from "react-native";
import { XStack } from "tamagui";

interface NotificationCardSkeletonProps {
  width?: number;
  height?: number;
}

export function NotificationCardSkeleton({
  width = 350,
  height = 80,
}: NotificationCardSkeletonProps = {}) {
  const colorScheme = useColorScheme();

  const backgroundColor = colorScheme === "dark" ? "#1a1a1a" : "#f3f3f3";
  const foregroundColor = colorScheme === "dark" ? "#2a2a2a" : "#e8e8e8";

  return (
    <XStack gap="$3" alignItems="center" borderRadius="$5" padding="$2">
      <ContentLoader
        speed={2}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
      >
        {/* Left side - Profile/Listing image */}
        <Rect x="0" y="10" rx="6" ry="6" width="60" height="60" />

        {/* Right side content */}
        {/* Title and timestamp row */}
        <Rect x="75" y="15" rx="3" ry="3" width="180" height="16" />
        <Rect x="280" y="15" rx="3" ry="3" width="50" height="12" />

        {/* Body text - 2 lines */}
        <Rect x="75" y="40" rx="3" ry="3" width="250" height="14" />
        <Rect x="75" y="58" rx="3" ry="3" width="180" height="14" />
      </ContentLoader>
    </XStack>
  );
}
