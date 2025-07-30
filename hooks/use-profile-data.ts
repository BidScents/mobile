import {
  useFollowUser,
  useProfileDetail,
  useProfileListings,
  useProfileReviews,
  useUnfollowUser,
} from '@/hooks/queries/use-profile';
import {
  ListingSearchRequest,
  ProfileTab,
  ReviewSearchRequest,
} from '@bid-scents/shared-sdk';
import { useMemo } from 'react';

interface UseProfileDataProps {
  userId: string;
  listingSortParams: Record<string, Partial<ListingSearchRequest>>;
  reviewSortParams: Partial<ReviewSearchRequest>;
}

export const useProfileData = ({
  userId,
  listingSortParams,
  reviewSortParams,
}: UseProfileDataProps) => {
  // Profile data
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useProfileDetail(userId);

  // Listings data
  const {
    data: activeListingsData,
    isLoading: activeListingsLoading,
    isFetchingNextPage: activeListingsFetchingNext,
    hasNextPage: activeListingsHasNext,
    fetchNextPage: fetchNextActiveListings,
    refetch: refetchActiveListings,
  } = useProfileListings(userId, ProfileTab.ACTIVE, listingSortParams.active);

  const {
    data: featuredListingsData,
    isLoading: featuredListingsLoading,
    isFetchingNextPage: featuredListingsFetchingNext,
    hasNextPage: featuredListingsHasNext,
    fetchNextPage: fetchNextFeaturedListings,
    refetch: refetchFeaturedListings,
  } = useProfileListings(userId, ProfileTab.FEATURED, listingSortParams.featured);

  const {
    data: soldListingsData,
    isLoading: soldListingsLoading,
    isFetchingNextPage: soldListingsFetchingNext,
    hasNextPage: soldListingsHasNext,
    fetchNextPage: fetchNextSoldListings,
    refetch: refetchSoldListings,
  } = useProfileListings(userId, ProfileTab.SOLD, listingSortParams.sold);

  // Reviews data
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isFetchingNextPage: reviewsFetchingNext,
    hasNextPage: reviewsHasNext,
    fetchNextPage: fetchNextReviews,
    refetch: refetchReviews,
  } = useProfileReviews(userId, reviewSortParams);

  // Follow mutations
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  // Flatten data from infinite queries with debugging
  const flattenedData = useMemo(() => {
    const active = activeListingsData?.pages.flatMap(page => page.listings) || [];
    const featured = featuredListingsData?.pages.flatMap(page => page.listings) || [];
    const sold = soldListingsData?.pages.flatMap(page => page.listings) || [];
    const reviews = reviewsData?.pages.flatMap(page => page.reviews) || [];

    return {
      active,
      featured,
      sold,
      reviews,
    };
  }, [activeListingsData, featuredListingsData, soldListingsData, reviewsData]);

  // Refresh function
  const refreshAll = async () => {
    await Promise.all([
      refetchProfile(),
      refetchActiveListings(),
      refetchFeaturedListings(),
      refetchSoldListings(),
      refetchReviews(),
    ]);
  };

  return {
    // Profile data
    profileData,
    profileLoading,
    profileError,
    
    // Flattened data
    flattenedData,
    
    // Loading states
    activeListingsLoading,
    featuredListingsLoading,
    soldListingsLoading,
    reviewsLoading,
    
    // Fetching states
    activeListingsFetchingNext,
    featuredListingsFetchingNext,
    soldListingsFetchingNext,
    reviewsFetchingNext,
    
    // Has next page states
    activeListingsHasNext,
    featuredListingsHasNext,
    soldListingsHasNext,
    reviewsHasNext,
    
    // Fetch next page functions
    fetchNextActiveListings,
    fetchNextFeaturedListings,
    fetchNextSoldListings,
    fetchNextReviews,
    
    // Follow mutations
    followMutation,
    unfollowMutation,
    
    // Refresh function
    refreshAll,
  };
};
