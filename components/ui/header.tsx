import FastImage from "@d11/react-native-fast-image";
import { ImageZoom } from "@likashefqet/react-native-image-zoom";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "tamagui";
import { useThemeColors } from "../../hooks/use-theme-colors";
import { BlurBackButton } from "./blur-back-button";
import { ThemedIonicons } from "./themed-icons";

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
  rightIcon?: any;
  rightIconPress?: () => void;
}) {
  const colors = useThemeColors();
  const [isModalVisible, setModalVisible] = useState(false);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

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
            tint={colors.blurTint as any}
            intensity={80}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ThemedIonicons name={rightIcon}  size={20} />
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
      <Pressable
        onPress={() => setModalVisible(true)}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: header_height_expanded + header_height_narrowed,
          zIndex: 0,
        }}
      >
        <Animated.View
          style={{
            width: "100%",
            height: "100%",
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
          <FastImage
            source={{
              uri: profile_banner_uri,
              priority: FastImage.priority.high,
            }}
            style={StyleSheet.absoluteFill}
            resizeMode={FastImage.resizeMode.cover}
          />
          <AnimatedBlurView
            tint={colors.blurTint as any}
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
        </Animated.View>
      </Pressable>

      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
        animationType="fade"
      >
        <View flex={1} backgroundColor="$background">
          <ImageZoom
            uri={profile_banner_uri}
            minScale={1}
            maxScale={5}
            doubleTapScale={3}
            isSingleTapEnabled
            isDoubleTapEnabled
            style={{ width: screenWidth, height: screenHeight }}
            resizeMode="contain"
          />
          <Pressable
            onPress={() => setModalVisible(false)}
            style={{
              position: "absolute",
              top: insets.top + 10,
              right: 20,
              zIndex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: 20,
              padding: 5,
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ThemedIonicons name="close" size={20} color="$foreground" />
          </Pressable>
        </View>
      </Modal>
    </>
  );
}
