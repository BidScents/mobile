import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "tamagui";
import { useThemeColors } from "../../hooks/use-theme-colors";
import { ThemedIonicons } from "./themed-icons";

interface ListingEditButtonProps {
  /** Size of the button (diameter) */
  size?: number;
  /** Top position offset from safe area */
  topOffset?: number;
  /** Left position offset */
  leftOffset?: number;
  /** Icon size */
  iconSize?: number;
  /** Listing ID */
  listingId: string;
  /** Z-index for positioning */
  zIndex?: number;
}

export function ListingEditButton({
  size = 35,
  topOffset = 10,
  leftOffset = 20,
  iconSize,
  listingId,
  zIndex = 2,
}: ListingEditButtonProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  // Calculate icon size based on button size if not provided
  const calculatedIconSize = iconSize ?? Math.round(size * 0.68);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/listing/${listingId}/edit`)
  };

  return (
    <View
      style={{
        zIndex,
        position: "absolute",
        top: insets.top + topOffset,
        right: leftOffset,
        height: size,
        width: size,
        borderRadius: size / 2,
        overflow: "hidden",
      }}
      onPress={handlePress}
      hitSlop={{
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      }}
      pressStyle={{
        opacity: 0.7,
      }}
    >
      <BlurView
        tint={colors.blurTint as any}
        intensity={80}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ThemedIonicons name="settings-outline" size={calculatedIconSize} />
      </BlurView>
    </View>
  );
}
