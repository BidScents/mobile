import { Container } from "@/components/ui/container";
import Header from "@/components/ui/header";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { router } from "expo-router";
import React, { useRef } from "react";
import { Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, XStack, YStack, useTheme } from "tamagui";

const HEADER_HEIGHT_EXPANDED = 35;
const HEADER_HEIGHT_NARROWED = 110;

export default function DetailedProfileScreen() {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const theme = useTheme();

  console.log(user);

  return (
    <Container
      variant="fullscreen"
      safeArea={false}
      backgroundColor="$background"
    >
      <Header
        insets={insets}
        scrollY={scrollY}
        profile_banner_uri={
          "https://mcdn.wallpapersafari.com/medium/7/10/qGIfHa.jpg"
        }
        header_height_expanded={HEADER_HEIGHT_EXPANDED}
        header_height_narrowed={HEADER_HEIGHT_NARROWED}
        name={`${user?.first_name} ${user?.last_name}`}
        username={user?.username || "username"}
        rightIcon="settings-outline"
        rightIconPress={() => router.back()}
      />

      {/* Tweets/profile */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: { y: scrollY },
              },
            },
          ],
          { useNativeDriver: true }
        )}
        style={{
          zIndex: 3,
          marginTop: HEADER_HEIGHT_NARROWED,
          paddingTop: HEADER_HEIGHT_EXPANDED,
        }}
      >
        <View flex={1} backgroundColor="$background" paddingHorizontal="$4">
          <Animated.Image
            source={{
              uri:
                user?.profile_image_url ||
                "https://avatar.iran.liara.run/public",
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
                    inputRange: [0, HEADER_HEIGHT_EXPANDED],
                    outputRange: [1, 0.6],
                    extrapolate: "clamp",
                  }),
                },
                {
                  translateY: scrollY.interpolate({
                    inputRange: [0, HEADER_HEIGHT_EXPANDED],
                    outputRange: [0, 16],
                    extrapolate: "clamp",
                  }),
                },
              ],
            }}
          />

          <View gap="$2">
            {/* Name + username */}
            <View gap="$1">
              <View>
                <Text fontWeight="500" fontSize="$7" color="$foreground">
                  {user?.first_name} {user?.last_name}
                </Text>

                <Text fontWeight="500" fontSize="$5" color="$mutedForeground">
                  @{user?.username}
                </Text>
              </View>
            </View>

            <YStack gap="$1.5">
              {/* Location */}
              <Text fontSize="$5">{user?.location || "Toronto, ON"}</Text>

              {/* Join date */}
              <Text fontSize="$5">Member since {(user?.onboarded_at || "2025-05-22T23:32:46Z").split("T")[0].split("-")[0]}</Text>

              {/* Follow stats */}
              <XStack gap="$3">
                <Text fontWeight="bold" fontSize="$4" color="$foreground">
                  70{" "}
                  <Text fontWeight="normal" color="$mutedForeground">
                    Following
                  </Text>
                </Text>

                <Text fontWeight="bold" fontSize="$4" color="$foreground">
                  106{" "}
                  <Text fontWeight="normal" color="$mutedForeground">
                    Followers
                  </Text>
                </Text>
              </XStack>
            </YStack>

            {/* Rating */}
            <View></View>

            {/* Bio */}
            <Text fontSize="$5">{user?.bio}</Text>
          </View>
        </View>
      </Animated.ScrollView>
    </Container>
  );
}
