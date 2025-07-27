import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React from 'react';
import {
  Animated,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import {
  useSafeAreaInsets
} from 'react-native-safe-area-context';
import { Text, View } from 'tamagui';

const AnimatedImageBackground = Animated.createAnimatedComponent(
  ImageBackground
);

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
  return (
    <>

      {/* Back button */}
      <View
        style={{
          zIndex: 2,
          position: 'absolute',
          top: insets.top ,
          left: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          height: 30,
          width: 30,
          borderRadius: 15,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => router.back()}
        hitSlop={{
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        }}
      >
        <Ionicons name="chevron-back" color="white" size={22} />
      </View>

      {/* Right icon */}
      {rightIcon && (
        <View
          style={{
            zIndex: 2,
            position: 'absolute',
            top: insets.top,
            right: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            height: 30,
            width: 30,
            borderRadius: 15,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={rightIconPress}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >
          <Ionicons name={rightIcon} color="white" size={22} />
        </View>
      )}

      

      {/* Refresh arrow */}
      <Animated.View
        style={{
          zIndex: 2,
          position: 'absolute',
          top: insets.top + 10,
          left: 0,
          right: 0,
          alignItems: 'center',
          opacity: scrollY.interpolate({
            inputRange: [-20, 0],
            outputRange: [1, 0],
          }),
          transform: [
            {
              rotate: scrollY.interpolate({
                inputRange: [-45, -35],
                outputRange: ['180deg', '0deg'],
                extrapolate: 'clamp',
              }),
            },
          ],
        }}
      >
        <Ionicons name="arrow-down" color="white" size={24} />
      </Animated.View>

      {/* Name + tweets count */}
      <Animated.View
        style={{
          zIndex: 2,
          position: 'absolute',
          top: insets.top,
          left: 0,
          right: 0,
          alignItems: 'center',
          opacity: scrollY.interpolate({
            inputRange: [90, 110],
            outputRange: [0, 1],
          }),
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [90, 120],
                outputRange: [30, 0],
                extrapolate: 'clamp',
              }),
            },
          ],
        }}
      >
        <Text color="$background" fontSize="$4">@{username}</Text>

        <Text color="$background" fontSize="$4">
          {name}
        </Text>
      </Animated.View>

      {/* Banner */}
      <AnimatedImageBackground
        source={{
          uri: profile_banner_uri,
        }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: header_height_expanded + header_height_narrowed,
          transform: [
            {
              scale: scrollY.interpolate({
                inputRange: [-200, 0],
                outputRange: [5, 1],
                extrapolateLeft: 'extend',
                extrapolateRight: 'clamp',
              }),
            },
          ],
        }}
      >
        <AnimatedBlurView
          tint="dark"
          intensity={96}
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