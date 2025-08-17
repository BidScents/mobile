import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import {
  Animated,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, useTheme } from "tamagui";
import { BlurBackButton } from "./blur-back-button";

const AnimatedImageBackground =
  Animated.createAnimatedComponent(ImageBackground);

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function Header({
  insets,
  scrollY,
  profile_banner_uri,
  header_height_expanded,
  header_height_narrowed,
  name,
  username,
  rightIcon,
  rightIconPress,
}: {
  insets: ReturnType<typeof useSafeAreaInsets>;
  scrollY: Animated.Value;
  profile_banner_uri: string;
  header_height_expanded: number;
  header_height_narrowed: number;
  name: string;
  username: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightIconPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <>
      {/* Back button */}
      <BlurBackButton size={30} topOffset={0} leftOffset={20} iconSize={20} />

      {/* Right icon */}
      {rightIcon && (
        <View
          style={{
            zIndex: 2,
            position: "absolute",
            top: insets.top,
            right: 20,
            height: 30,
            width: 30,
            borderRadius: 15,
            overflow: "hidden",
          }}
          onPress={rightIconPress}
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
            <Ionicons name={rightIcon} color={theme.foreground.get()} size={20} />
          </BlurView>
        </View>
      )}

      {/* Name + username */}
      <Animated.View
        style={{
          zIndex: 2,
          position: "absolute",
          top: insets.top,
          left: 0,
          right: 0,
          alignItems: "center",
          opacity: scrollY.interpolate({
            inputRange: [65, 110],
            outputRange: [0, 1],
          }),
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [65, 120],
                outputRange: [30, 0],
                extrapolate: "clamp",
              }),
            },
          ],
        }}
      >
        <Text color="$foreground" fontSize="$4" fontWeight="500">
          @{username}
        </Text>

        <Text color="$foreground" fontSize="$4" fontWeight="500">
          {name}
        </Text>
      </Animated.View>

      {/* Banner */}
      <AnimatedImageBackground
        source={{
          uri: profile_banner_uri,
        }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: header_height_expanded + header_height_narrowed,
          transform: [
            {
              scale: scrollY.interpolate({
                inputRange: [-200, 0],
                outputRange: [5, 1],
                extrapolateLeft: "extend",
                extrapolateRight: "clamp",
              }),
            },
          ],
        }}
      >
        <AnimatedBlurView
          tint={theme.blurTint.get() as any}
          intensity={80}
          style={{
            ...StyleSheet.absoluteFillObject,
            zIndex: 2,
            opacity: scrollY.interpolate({
              inputRange: [-50, 0, 50, 100],
              outputRange: [1, 0, 0, 1],
            }),
          }}
        />
      </AnimatedImageBackground>
    </>
  );
}
