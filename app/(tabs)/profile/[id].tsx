import { ProfileContentTab } from "@/components/listing/profile-content-tab";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import Header from "@/components/ui/header";
import TabView from "@/components/ui/tab-view";
import {
  useFollowUser,
  useProfileDetail,
  useUnfollowUser,
} from "@/hooks/queries/use-profile";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, XStack, YStack, useTheme } from "tamagui";

const HEADER_HEIGHT_EXPANDED = 35;
const HEADER_HEIGHT_NARROWED = 110;

// Memoized ProfileContentTab to prevent unnecessary re-renders
const MemoizedProfileContentTab = React.memo(ProfileContentTab);

export default function DetailedProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const isProfileOwner = id === user?.id;
  const {
    data: profileData,
    isLoading,
    error,
    refetch,
  } = useProfileDetail(id!);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  console.log(refreshing)

  const handleTabChange = useCallback((tabKey: string) => {
    console.log("Active tab changed to:", tabKey);
  }, []);

  // Memoize tab configuration to prevent recreation on every render
  const tabsConfig = useMemo(() => [
    {
      key: "active",
      title: "Active",
      content: (
        <MemoizedProfileContentTab
          contentType="active"
          data={profileData?.active_listings?.listings}
          isLoading={isLoading || refreshing}
        />
      ),
    },
    {
      key: "featured",
      title: "Featured",
      content: (
        <MemoizedProfileContentTab
          contentType="featured"
          data={profileData?.featured_listings?.listings}
          isLoading={isLoading || refreshing}
        />
      ),
    },
    {
      key: "sold",
      title: "Sold",
      content: (
        <MemoizedProfileContentTab
          contentType="sold"
          data={profileData?.sold_listings?.listings}
          isLoading={isLoading || refreshing}
        />
      ),
    },
    {
      key: "reviews",
      title: "Reviews",
      content: (
        <MemoizedProfileContentTab
          contentType="reviews"
          data={profileData?.reviews?.reviews}
          isLoading={isLoading || refreshing}
        />
      ),
    },
  ], [profileData, isLoading, refreshing]);

  const onRefresh = useCallback(async () => {
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

  if (isLoading && !profileData) {
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
            router.push("/(tabs)");
          } else {
            console.log("Show options menu");
          }
        }}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        style={{
          zIndex: 3,
          marginTop: HEADER_HEIGHT_NARROWED,
          paddingTop: HEADER_HEIGHT_EXPANDED,
        }}
      >
        <View flex={1} backgroundColor="$background">
          <View paddingHorizontal="$4">
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
              {/* Profile Info */}
              <View gap="$1">
                <Text fontWeight="500" fontSize="$7" color="$foreground">
                  {profile.name}
                </Text>
                <Text fontWeight="500" fontSize="$5" color="$mutedForeground">
                  @{profile.username}
                </Text>
              </View>

              <YStack gap="$1.5">
                {profile.location && (
                  <Text fontSize="$5" color="$foreground">
                    {profile.location}
                  </Text>
                )}

                <Text fontSize="$5" color="$mutedForeground">
                  Member since {new Date(profile.joined_at).getFullYear()}
                </Text>

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

              {/* Action Button */}
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
            </View>
          </View>

          {/* Unified Tab System */}
          <TabView
            tabs={tabsConfig}
            initialTab="active"
            onTabChange={handleTabChange}
            headerProps={{
              marginTop: "$4",
              fontSize: "$4",
              fontWeight: "600",
              paddingHorizontal: "$3",
            }}
          />
        </View>
      </Animated.ScrollView>
    </Container>
  );
}