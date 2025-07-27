import type {
    EditProfileRequest,
    ListingSearchRequest,
    ProfileResponse,
    ProfileTab,
    ReviewSearchRequest
} from '@bid-scents/shared-sdk'
import { ProfileService, useAuthStore } from '@bid-scents/shared-sdk'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './query-keys'

// ========================================
// QUERIES
// ========================================

/**
 * Main profile query - gets profile details with initial data for all tabs
 */
export function useProfileDetail(userId: string) {
  return useQuery({
    queryKey: queryKeys.profile.detail(userId),
    queryFn: () => ProfileService.getProfileV1ProfileUserIdGet(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId,
  })
}

/**
 * User preview query - for comments, bids, etc.
 */
export function useProfilePreview(userId: string) {
  return useQuery({
    queryKey: queryKeys.profile.preview(userId),
    queryFn: () => ProfileService.getUserPreviewV1ProfileUserIdPreviewGet(userId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!userId,
  })
}

/**
 * Infinite query for loading more listings in a specific tab
 */
export function useProfileListings(
  userId: string,
  tab: ProfileTab,
  filters?: Partial<ListingSearchRequest>
) {
  const defaultFilters: ListingSearchRequest = {
    page: 1,
    per_page: 20,
    ...filters,
  }

  return useInfiniteQuery({
    queryKey: queryKeys.profile.listings(userId, tab, defaultFilters),
    queryFn: ({ pageParam = 1 }) =>
      ProfileService.getUserListingsV1ProfileUserIdTabNamePost(
        userId,
        tab,
        { ...defaultFilters, page: pageParam }
      ),
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination_data
      return page < total_pages ? page + 1 : undefined
    },
    initialPageParam: 1,
    enabled: !!userId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

/**
 * Infinite query for loading more reviews
 */
export function useProfileReviews(
  userId: string,
  filters?: Partial<ReviewSearchRequest>
) {
  const defaultFilters: ReviewSearchRequest = {
    page: 1,
    per_page: 10,
    ...filters,
  }

  return useInfiniteQuery({
    queryKey: queryKeys.profile.reviews(userId, defaultFilters),
    queryFn: ({ pageParam = 1 }) =>
      ProfileService.getUserReviewsV1ProfileUserIdReviewsPost(
        userId,
        { ...defaultFilters, page: pageParam }
      ),
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination_data
      return page < total_pages ? page + 1 : undefined
    },
    initialPageParam: 1,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ========================================
// MUTATIONS
// ========================================

/**
 * Follow user mutation with optimistic updates
 */
export function useFollowUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => ProfileService.followUserV1ProfileUserIdFollowPost(userId),
    onMutate: async (userId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.profile.detail(userId) })
      
      // Get current data
      const previousData = queryClient.getQueryData<ProfileResponse>(queryKeys.profile.detail(userId))
      
      // Optimistically update follow status
      if (previousData) {
        queryClient.setQueryData<ProfileResponse>(queryKeys.profile.detail(userId), (old) => ({
          ...old!,
          profile: {
            ...old!.profile,
            is_following: true,
            follower_count: old!.profile.follower_count + 1
          }
        }))
      }
      
      return { previousData }
    },
    onError: (err, userId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.profile.detail(userId), context.previousData)
      }
    },
    onSettled: (data, error, userId) => {
      // Refetch to ensure consistency (optional - only if needed)
      // queryClient.invalidateQueries({ queryKey: profileQueryKeys.detail(userId) })
    }
  })
}

/**
 * Unfollow user mutation with optimistic updates
 */
export function useUnfollowUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => ProfileService.unfollowUserV1ProfileUserIdUnfollowDelete(userId),
    onMutate: async (userId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.profile.detail(userId) })
      
      // Get current data
      const previousData = queryClient.getQueryData<ProfileResponse>(queryKeys.profile.detail(userId))
      
      // Optimistically update follow status
      if (previousData) {
        queryClient.setQueryData<ProfileResponse>(queryKeys.profile.detail(userId), (old) => ({
          ...old!,
          profile: {
            ...old!.profile,
            is_following: false,
            follower_count: Math.max(0, old!.profile.follower_count - 1) // Prevent negative
          }
        }))
      }
      
      return { previousData }
    },
    onError: (err, userId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.profile.detail(userId), context.previousData)
      }
    },
    onSettled: (data, error, userId) => {
      // Refetch to ensure consistency (optional - only if needed)
      // queryClient.invalidateQueries({ queryKey: queryKeys.profile.detail(userId) })
    }
  })
}

/**
 * Edit profile mutation with immediate auth store update
 */
export function useEditProfile() {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: EditProfileRequest }) =>
      ProfileService.editProfileV1ProfileUserIdEditProfilePatch(userId, data),
    onSuccess: (updatedUser, { userId }) => {
      // Immediately update auth store
      setUser(updatedUser)
      
      // Update the profile cache
      queryClient.setQueryData<ProfileResponse>(queryKeys.profile.detail(userId), (old) => {
        if (!old) return old
        
        return {
          ...old,
          profile: {
            ...old.profile,
            name: `${updatedUser.first_name} ${updatedUser.last_name}`,
            username: updatedUser.username,
            bio: updatedUser.bio || old.profile.bio,
            location: updatedUser.location || old.profile.location,
            profile_picture: updatedUser.profile_image_url || old.profile.profile_picture,
            cover_image: updatedUser.cover_image_url || old.profile.cover_image,
          }
        }
      })

      // Invalidate preview queries that might show outdated user info
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all })
    }
  })
}

// ========================================
// HELPER HOOKS
// ========================================

/**
 * Get combined listings data from profile detail + infinite queries
 */
export function useCombinedListings(
  userId: string,
  tab: ProfileTab,
  profileData?: ProfileResponse
) {
  const infiniteListings = useProfileListings(userId, tab)
  
  // Get initial data from profile detail
  const getInitialListings = () => {
    if (!profileData) return []
    
    switch (tab) {
      case 'ACTIVE' as ProfileTab.ACTIVE:
        return profileData.active_listings?.listings || []
      case 'FEATURED' as ProfileTab.FEATURED:
        return profileData.featured_listings?.listings || []
      case 'SOLD' as ProfileTab.SOLD:
        return profileData.sold_listings?.listings || []
      default:
        return []
    }
  }

  // Combine initial + infinite data
  const allListings = [
    ...getInitialListings(),
    ...(infiniteListings.data?.pages.flatMap(page => page.listings) || [])
  ]

  return {
    listings: allListings,
    hasNextPage: infiniteListings.hasNextPage,
    fetchNextPage: infiniteListings.fetchNextPage,
    isFetchingNextPage: infiniteListings.isFetchingNextPage,
    isLoading: infiniteListings.isLoading,
    error: infiniteListings.error,
  }
}

/**
 * Get combined reviews data from profile detail + infinite queries
 */
export function useCombinedReviews(userId: string, profileData?: ProfileResponse) {
  const infiniteReviews = useProfileReviews(userId)
  
  // Get initial data from profile detail
  const initialReviews = profileData?.reviews?.reviews || []
  
  // Combine initial + infinite data
  const allReviews = [
    ...initialReviews,
    ...(infiniteReviews.data?.pages.flatMap(page => page.reviews) || [])
  ]

  return {
    reviews: allReviews,
    reviewsTab: profileData?.reviews,
    hasNextPage: infiniteReviews.hasNextPage,
    fetchNextPage: infiniteReviews.fetchNextPage,
    isFetchingNextPage: infiniteReviews.isFetchingNextPage,
    isLoading: infiniteReviews.isLoading,
    error: infiniteReviews.error,
  }
}