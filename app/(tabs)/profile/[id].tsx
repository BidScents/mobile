import { ProfileDetails } from "@/components/profile/profile-details";
import { ProfileError } from "@/components/profile/profile-loading-states";
import { ProfileSkeleton } from "@/components/suspense/profile-skeleton";
import { Container } from "@/components/ui/container";
import Header from "@/components/ui/header";
import TabView from "@/components/ui/tab-view";
import { useProfileData } from "@/hooks/use-profile-data";
import { useProfileSort } from "@/hooks/use-profile-sort";
import { useProfileTabs } from "@/hooks/use-profile-tabs";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Animated, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, useTheme } from "tamagui";

const HEADER_HEIGHT_EXPANDED = 55;
const HEADER_HEIGHT_NARROWED = 110;

export default function DetailedProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'featured' | 'sold' | 'reviews'>('active');

  const isProfileOwner = id === user?.id;

  // Use custom hooks for modular state management
  const {
    listingSortParams,
    reviewSortParams,
    currentSortValues,
    updateListingSort,
    updateReviewSort,
  } = useProfileSort();

  // Use custom hook for data fetching
  const {
    profileData,
    profileLoading,
    profileError,
    flattenedData,
    activeListingsLoading,
    featuredListingsLoading,
    soldListingsLoading,
    reviewsLoading,
    activeListingsFetchingNext,
    featuredListingsFetchingNext,
    soldListingsFetchingNext,
    reviewsFetchingNext,
    activeListingsHasNext,
    featuredListingsHasNext,
    soldListingsHasNext,
    reviewsHasNext,
    fetchNextActiveListings,
    fetchNextFeaturedListings,
    fetchNextSoldListings,
    fetchNextReviews,
    followMutation,
    unfollowMutation,
    refreshAll,
  } = useProfileData({
    userId: id!,
    listingSortParams,
    reviewSortParams,
  });

  // Use custom hook for tab configuration
  const { tabsConfig } = useProfileTabs({
    flattenedData,
    loadingStates: {
      activeListingsLoading,
      featuredListingsLoading,
      soldListingsLoading,
      reviewsLoading,
    },
    fetchingStates: {
      activeListingsFetchingNext,
      featuredListingsFetchingNext,
      soldListingsFetchingNext,
      reviewsFetchingNext,
    },
    hasNextStates: {
      activeListingsHasNext,
      featuredListingsHasNext,
      soldListingsHasNext,
      reviewsHasNext,
    },
    fetchNextFunctions: {
      fetchNextActiveListings,
      fetchNextFeaturedListings,
      fetchNextSoldListings,
      fetchNextReviews,
    },
    sortHandlers: {
      handleListingSortChange: updateListingSort,
      handleReviewSortChange: updateReviewSort,
    },
    currentSortValues,
  });

  const handleTabChange = useCallback((tabKey: string) => {
    setActiveTab(tabKey as typeof activeTab);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);

  const handleFollowToggle = () => {
    if (!profileData?.profile || isProfileOwner) return;

  if (profileData.profile.is_following) {
      unfollowMutation.mutate(id!);
    } else {
      followMutation.mutate(id!);
    }
  };

  // Loading state
  if (profileLoading && profileData) {
    return <ProfileSkeleton />;
  }

  // Error state
  if (profileError || !profileData) {
    return <ProfileError error={profileError || undefined} />;
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
            router.push("/(tabs)/profile/edit-profile");
          } else {
            router.push("/(tabs)/profile/report-profile");
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
          {/* Profile Details */}
          <ProfileDetails
            profile={profile}
            isProfileOwner={isProfileOwner}
            isFollowLoading={followMutation.isPending || unfollowMutation.isPending}
            onFollowToggle={handleFollowToggle}
          />

          {/* Enhanced Tab System with Sort Support */}
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