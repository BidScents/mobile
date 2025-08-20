import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, View } from "tamagui";

interface BlurBackButtonProps {
  /** Size of the button (diameter) */
  size?: number;
  /** Top position offset from safe area */
  topOffset?: number;
  /** Left position offset */
  leftOffset?: number;
  /** Icon size */
  iconSize?: number;
  /** Custom onPress handler (defaults to router.back()) */
  onPress?: () => void;
  /** Z-index for positioning */
  zIndex?: number;
}

export function BlurBackButton({
  size = 35,
  topOffset = 10,
  leftOffset = 20,
  iconSize,
  onPress,
  zIndex = 2,
}: BlurBackButtonProps = {}) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  
  // Calculate icon size based on button size if not provided
  const calculatedIconSize = iconSize ?? Math.round(size * 0.68);
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={{
        zIndex,
        position: "absolute",
        top: insets.top + topOffset,
        left: leftOffset,
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
        tint={theme.blurTint.get() as any}
        intensity={80}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name="chevron-back"
          color={theme.foreground.get()}
          size={calculatedIconSize}
        />
      </BlurView>
    </View>
  );
}