import { ProfileContentTab } from "@/components/profile/profile-content-tab";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import Header from "@/components/ui/header";
import TabView from "@/components/ui/tab-view";
import {
  useFollowUser,
  useProfileDetail,
  useProfileListings,
  useProfileReviews,
  useUnfollowUser,
} from "@/hooks/queries/use-profile";
import {
  ListingSearchRequest,
  ListingSortField,
  ProfileTab,
  ReviewSearchRequest,
  ReviewSortField,
  useAuthStore
} from "@bid-scents/shared-sdk";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, XStack, YStack, useTheme } from "tamagui";

const HEADER_HEIGHT_EXPANDED = 35;
const HEADER_HEIGHT_NARROWED = 110;

// Default sort configurations
const DEFAULT_LISTING_SORT: Partial<ListingSearchRequest> = {
  sort: ListingSortField.CREATED_AT,
  descending: true,
};

const DEFAULT_REVIEW_SORT: Partial<ReviewSearchRequest> = {
  sort: ReviewSortField.CREATED_AT,
  descending: true,
};

// Memoized ProfileContentTab to prevent unnecessary re-renders
const MemoizedProfileContentTab = React.memo(ProfileContentTab);

export default function DetailedProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'featured' | 'sold' | 'reviews'>('active');

  // Sort state management
  const [listingSortParams, setListingSortParams] = useState<Record<string, Partial<ListingSearchRequest>>>({
    active: DEFAULT_LISTING_SORT,
    featured: DEFAULT_LISTING_SORT,
    sold: DEFAULT_LISTING_SORT,
  });
  const [reviewSortParams, setReviewSortParams] = useState<Partial<ReviewSearchRequest>>(DEFAULT_REVIEW_SORT);

  // Sort tracking for UI (maps sort params back to option values)
  const [currentSortValues, setCurrentSortValues] = useState<Record<string, string>>({
    active: 'newest',
    featured: 'newest',
    sold: 'newest',
    reviews: 'newest',
  });

  const isProfileOwner = id === user?.id;

  // Enhanced queries with sort support
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useProfileDetail(id!);

  const {
    data: activeListingsData,
    isLoading: activeListingsLoading,
    isFetchingNextPage: activeListingsFetchingNext,
    hasNextPage: activeListingsHasNext,
    fetchNextPage: fetchNextActiveListings,
    refetch: refetchActiveListings,
  } = useProfileListings(id!, ProfileTab.ACTIVE, listingSortParams.active);

  const {
    data: featuredListingsData,
    isLoading: featuredListingsLoading,
    isFetchingNextPage: featuredListingsFetchingNext,
    hasNextPage: featuredListingsHasNext,
    fetchNextPage: fetchNextFeaturedListings,
    refetch: refetchFeaturedListings,
  } = useProfileListings(id!, ProfileTab.FEATURED, listingSortParams.featured);

  const {
    data: soldListingsData,
    isLoading: soldListingsLoading,
    isFetchingNextPage: soldListingsFetchingNext,
    hasNextPage: soldListingsHasNext,
    fetchNextPage: fetchNextSoldListings,
    refetch: refetchSoldListings,
  } = useProfileListings(id!, ProfileTab.SOLD, listingSortParams.sold);

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isFetchingNextPage: reviewsFetchingNext,
    hasNextPage: reviewsHasNext,
    fetchNextPage: fetchNextReviews,
    refetch: refetchReviews,
  } = useProfileReviews(id!, reviewSortParams);

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  // Helper function to map sort params to UI values
  const getSortValueFromParams = useCallback((params: any, isReview = false) => {
    const { sort, descending } = params;
    
    if (isReview) {
      if (sort === ReviewSortField.CREATED_AT && descending) return 'newest';
      if (sort === ReviewSortField.CREATED_AT && !descending) return 'oldest';
      if (sort === ReviewSortField.RATING && descending) return 'rating_desc';
      if (sort === ReviewSortField.RATING && !descending) return 'rating_asc';
    } else {
      if (sort === ListingSortField.CREATED_AT && descending) return 'newest';
      if (sort === ListingSortField.CREATED_AT && !descending) return 'oldest';
      if (sort === ListingSortField.PRICE && !descending) return 'price_asc';
      if (sort === ListingSortField.PRICE && descending) return 'price_desc';
    }
    
    return 'newest'; // fallback
  }, []);

  // Sort change handlers
  const handleListingSortChange = useCallback((tab: 'active' | 'featured' | 'sold', newSortParams: Partial<ListingSearchRequest>) => {
    setListingSortParams(prev => ({
      ...prev,
      [tab]: { ...prev[tab], ...newSortParams }
    }));
    
    const sortValue = getSortValueFromParams(newSortParams);
    setCurrentSortValues(prev => ({
      ...prev,
      [tab]: sortValue
    }));
  }, [getSortValueFromParams]);

  const handleReviewSortChange = useCallback((newSortParams: Partial<ReviewSearchRequest>) => {
    setReviewSortParams(prev => ({ ...prev, ...newSortParams }));
    
    const sortValue = getSortValueFromParams(newSortParams, true);
    setCurrentSortValues(prev => ({
      ...prev,
      reviews: sortValue
    }));
  }, [getSortValueFromParams]);

  // Flatten data from infinite queries with debugging
  const flattenedData = useMemo(() => {
    const active = activeListingsData?.pages.flatMap(page => page.listings) || [];
    const featured = featuredListingsData?.pages.flatMap(page => page.listings) || [];
    const sold = soldListingsData?.pages.flatMap(page => page.listings) || [];
    const reviews = reviewsData?.pages.flatMap(page => page.reviews) || [];

    // Debug logging
    if (active.length > 0) {
      console.log('Debug - Active listings:', {
        totalItems: active.length,
        pages: activeListingsData?.pages.map(page => ({
          itemCount: page.listings.length,
          paginationData: page.pagination_data
        }))
      });
    }

    return {
      active,
      featured,
      sold,
      reviews,
    };
  }, [activeListingsData, featuredListingsData, soldListingsData, reviewsData]);

  const handleTabChange = useCallback((tabKey: string) => {
    setActiveTab(tabKey as typeof activeTab);
  }, []);

  // Memoize tab configuration to prevent recreation on every render
  const tabsConfig = useMemo(() => [
    {
      key: "active",
      title: "Active",
      content: (
        <MemoizedProfileContentTab
          contentType="active"
          data={flattenedData.active}
          isLoading={activeListingsLoading}
          isFetchingNextPage={activeListingsFetchingNext}
          hasNextPage={activeListingsHasNext}
          onLoadMore={fetchNextActiveListings}
          onSortChange={(params) => handleListingSortChange('active', params as Partial<ListingSearchRequest>)}
          currentSort={currentSortValues.active}
        />
      ),
    },
    {
      key: "featured",
      title: "Featured",
      content: (
        <MemoizedProfileContentTab
          contentType="featured"
          data={flattenedData.featured}
          isLoading={featuredListingsLoading}
          isFetchingNextPage={featuredListingsFetchingNext}
          hasNextPage={featuredListingsHasNext}
          onLoadMore={fetchNextFeaturedListings}
          onSortChange={(params) => handleListingSortChange('featured', params as Partial<ListingSearchRequest>)}
          currentSort={currentSortValues.featured}
        />
      ),
    },
    {
      key: "sold",
      title: "Sold",
      content: (
        <MemoizedProfileContentTab
          contentType="sold"
          data={flattenedData.sold}
          isLoading={soldListingsLoading}
          isFetchingNextPage={soldListingsFetchingNext}
          hasNextPage={soldListingsHasNext}
          onLoadMore={fetchNextSoldListings}
          onSortChange={(params) => handleListingSortChange('sold', params as Partial<ListingSearchRequest>)}
          currentSort={currentSortValues.sold}
        />
      ),
    },
    {
      key: "reviews",
      title: "Reviews",
      content: (
        <MemoizedProfileContentTab
          contentType="reviews"
          data={flattenedData.reviews}
          isLoading={reviewsLoading}
          isFetchingNextPage={reviewsFetchingNext}
          hasNextPage={reviewsHasNext}
          onLoadMore={fetchNextReviews}
          onSortChange={handleReviewSortChange}
          currentSort={currentSortValues.reviews}
        />
      ),
    },
  ], [
    flattenedData,
    activeListingsLoading, activeListingsFetchingNext, activeListingsHasNext, fetchNextActiveListings,
    featuredListingsLoading, featuredListingsFetchingNext, featuredListingsHasNext, fetchNextFeaturedListings,
    soldListingsLoading, soldListingsFetchingNext, soldListingsHasNext, fetchNextSoldListings,
    reviewsLoading, reviewsFetchingNext, reviewsHasNext, fetchNextReviews,
    handleListingSortChange, handleReviewSortChange, currentSortValues
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchProfile(),
      refetchActiveListings(),
      refetchFeaturedListings(),
      refetchSoldListings(),
      refetchReviews(),
    ]);
    setRefreshing(false);
  }, [refetchProfile, refetchActiveListings, refetchFeaturedListings, refetchSoldListings, refetchReviews]);

  const handleFollowToggle = () => {
    if (!profileData?.profile || isProfileOwner) return;

    if (profileData.profile.is_following) {
      unfollowMutation.mutate(id!);
    } else {
      followMutation.mutate(id!);
    }
  };

  // Loading state
  if (profileLoading && !profileData) {
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
  if (profileError || !profileData) {
    return (
      <Container variant="fullscreen" safeArea backgroundColor="$background">
        <View flex={1} justifyContent="center" alignItems="center">
          <Text color="$red" fontSize="$6" fontWeight="600">
            Failed to load profile
          </Text>
          <Text color="$mutedForeground" marginTop="$2">
            {profileError?.message || "Profile not found"}
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
              ) : (
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
              )}
            </View>
          </View>

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