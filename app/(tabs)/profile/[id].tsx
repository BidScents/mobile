import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import Header from "@/components/ui/header";
import {
  useFollowUser,
  useProfileDetail,
  useUnfollowUser,
} from "@/hooks/queries/use-profile";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef } from "react";
import { ActivityIndicator, Animated, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, XStack, YStack, useTheme } from "tamagui";

const HEADER_HEIGHT_EXPANDED = 35;
const HEADER_HEIGHT_NARROWED = 110;

export default function DetailedProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const theme = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);

  const isProfileOwner = id === user?.id;
  const {
    data: profileData,
    isLoading,
    error,
    refetch,
  } = useProfileDetail(id!);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleFollowToggle = () => {
    if (!profileData?.profile || isProfileOwner) return;

    if (profileData.profile.is_following) {
      unfollowMutation.mutate(id!);
    } else {
      followMutation.mutate(id!);
    }
  };

  console.log(profileData);

  if (isLoading) {
    return (
      <Container variant="fullscreen" safeArea backgroundColor="$background">
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={theme.foreground?.val} />
          <Text marginTop="$4" color="$mutedForeground">
            Loading profile...
          </Text>
        </View>
      </Container>
    );
  }

  // Error state
  if (error || !profileData) {
    return (
      <Container variant="fullscreen" safeArea backgroundColor="$background">
        <View flex={1} justifyContent="center" alignItems="center">
          <Text color="$red" fontSize="$6" fontWeight="600">
            Failed to load profile
          </Text>
          <Text color="$mutedForeground" marginTop="$2">
            {error?.message || "Profile not found"}
          </Text>
          <Button
            marginTop="$4"
            variant="outline"
            onPress={() => router.back()}
          >
            Go Back
          </Button>
        </View>
      </Container>
    );
  }

  const profile = profileData.profile;

  return (
    <Container variant="fullscreen" safeArea={false}>
      <Header
        insets={insets}
        scrollY={scrollY}
        profile_banner_uri={
          `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${profile.cover_image}` ||
          "https://mcdn.wallpapersafari.com/medium/7/10/qGIfHa.jpg"
        }
        header_height_expanded={HEADER_HEIGHT_EXPANDED}
        header_height_narrowed={HEADER_HEIGHT_NARROWED}
        name={profile.name}
        username={profile.username}
        rightIcon={isProfileOwner ? "settings-outline" : "ellipsis-horizontal"}
        rightIconPress={() => {
          if (isProfileOwner) {
            // Navigate to settings/edit profile
            router.push("/(tabs)");
          } else {
            // Show options menu for other users
            console.log("Show options menu");
          }
        }}
      />

      {/* Profile Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
          {/* Profile Picture */}
          <Animated.Image
            source={{
              uri:
                profile.profile_picture ||
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
                  {profile.name}
                </Text>

                <Text fontWeight="500" fontSize="$5" color="$mutedForeground">
                  @{profile.username}
                </Text>
              </View>
            </View>

            <YStack gap="$1.5">
              {/* Location */}
              {profile.location && (
                <Text fontSize="$5" color="$foreground">
                  {profile.location}
                </Text>
              )}

              {/* Join date */}
              <Text fontSize="$5" color="$mutedForeground">
                Member since {new Date(profile.joined_at).getFullYear()}
              </Text>

              {/* Follow stats */}
              <XStack gap="$3">
                <Text fontWeight="bold" fontSize="$4" color="$foreground">
                  {profile.following_count}{" "}
                  <Text fontWeight="normal" color="$mutedForeground">
                    Following
                  </Text>
                </Text>

                <Text fontWeight="bold" fontSize="$4" color="$foreground">
                  {profile.follower_count}{" "}
                  <Text fontWeight="normal" color="$mutedForeground">
                    Followers
                  </Text>
                </Text>
              </XStack>
            </YStack>

            {/* Rating */}
            {profile.average_rating && profile.average_rating > 0 ? (
              <XStack alignItems="center" gap="$2">
                <Text fontWeight="bold" fontSize="$5" color="$foreground">
                  {profile.average_rating.toFixed(1)}
                </Text>
                <Text fontSize="$4" color="$mutedForeground">
                  ⭐ average rating
                </Text>
              </XStack>
            ) : (
              <Text fontSize="$5" color="$mutedForeground">
                No ratings yet
              </Text>
            )}

            {/* Bio */}
            {profile.bio && (
              <Text fontSize="$5" color="$foreground" lineHeight="$5">
                {profile.bio}
              </Text>
            )}

            {/* Action Buttons */}
            {isProfileOwner ? (
              <Button
                variant="secondary"
                onPress={() => router.push("/(tabs)")}
                marginTop="$3"
                fullWidth
              >
                Seller Dashboard
              </Button>
            ) : !profile.is_following ? (
              <Button
                variant="secondary"
                onPress={handleFollowToggle}
                disabled={
                  followMutation.isPending || unfollowMutation.isPending
                }
                marginTop="$3"
                fullWidth
              >
                {followMutation.isPending || unfollowMutation.isPending
                  ? "Loading..."
                  : profile.is_following
                  ? "Following"
                  : "Follow"}
              </Button>
            ) : null}

            {/* Profile Tabs - TODO: Add tab navigation here */}
            <View marginTop="$4">
              <Text fontSize="$6" fontWeight="600" color="$foreground">
                Listings & Reviews
              </Text>
              <Text fontSize="$4" color="$mutedForeground" marginTop="$1">
                Tab navigation coming next...
              </Text>

              {/* Debug info */}
              <View
                marginTop="$4"
                padding="$3"
                backgroundColor="$gray2"
                borderRadius="$4"
              >
                <Text fontSize="$3" color="$mutedForeground">
                  Active Listings:{" "}
                  {profileData.active_listings?.listings.length || 0}
                </Text>
                <Text fontSize="$3" color="$mutedForeground">
                  Featured Listings:{" "}
                  {profileData.featured_listings?.listings.length || 0}
                </Text>
                <Text fontSize="$3" color="$mutedForeground">
                  Sold Listings:{" "}
                  {profileData.sold_listings?.listings.length || 0}
                </Text>
                <Text fontSize="$3" color="$mutedForeground">
                  Reviews: {profileData.reviews?.reviews.length || 0}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </Container>
  );
}
