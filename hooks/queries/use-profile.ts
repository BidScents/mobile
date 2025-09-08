import type {
  EditProfileRequest,
  FollowerFollowingResponse,
  ListingSearchRequest,
  ProfileTab,
  ReviewSearchRequest
} from '@bid-scents/shared-sdk'
import { ProfileService, ReviewSortField, useAuthStore } from '@bid-scents/shared-sdk'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './query-keys'

// ========================================
// PROFILE DETAIL QUERY (Profile info only)
// ========================================

/**
* Profile detail query - gets ONLY profile details (no content data)
* Content data should use dedicated hooks below
*/
export function useProfileDetail(userId: string) {
return useQuery({
  queryKey: queryKeys.profile.detail(userId),
  queryFn: () => ProfileService.getProfileV1ProfileUserIdGet(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  enabled: !!userId,
  select: (data) => ({
    // Extract only the profile details, completely ignore all content data
    profile: data.profile
    // Explicitly NOT including: active_listings, featured_listings, sold_listings, reviews
  })
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

// ========================================
// CONTENT QUERIES WITH SORT SUPPORT
// ========================================

/**
* Enhanced profile listings hook with sort support
*/
export function useProfileListings(
userId: string,
tab: ProfileTab,
sortParams?: Partial<ListingSearchRequest>
) {
const searchRequest: ListingSearchRequest = {
  page: 1,
  per_page: 20,
  sort: undefined, // Let backend decide default sort per tab
  descending: true,
  listing_types: undefined,
  categories: undefined,
  ...sortParams, // Override with user preferences
}

return useInfiniteQuery({
  queryKey: queryKeys.profile.listings(userId, tab, searchRequest),
  queryFn: ({ pageParam = 1 }) => {
    const requestWithPage = { ...searchRequest, page: pageParam };
    
    return ProfileService.getUserListingsV1ProfileUserIdTabNamePost(
      userId,
      tab,
      requestWithPage
    );
  },
  getNextPageParam: (lastPage) => {
    const { page, total_pages } = lastPage.pagination_data
    return page < total_pages ? page + 1 : undefined
  },
  initialPageParam: 1,
  enabled: !!userId,
  staleTime: 3 * 60 * 1000, // 3 minutes
  // Prevent any automatic fetching
  refetchOnWindowFocus: false,
  refetchOnMount: false, // Changed to false to prevent auto-refetch
  refetchOnReconnect: false,
})
}

/**
* Enhanced profile reviews hook with sort support
*/
export function useProfileReviews(
userId: string,
sortParams?: Partial<ReviewSearchRequest>
) {
const searchRequest: ReviewSearchRequest = {
  page: 1,
  per_page: 10,
  min_rating: 0,
  sort: ReviewSortField.CREATED_AT, // Default sort
  descending: true,
  ...sortParams, // Override with user preferences
}

return useInfiniteQuery({
  queryKey: queryKeys.profile.reviews(userId, searchRequest),
  queryFn: ({ pageParam = 1 }) =>
    ProfileService.getUserReviewsV1ProfileUserIdReviewsPost(
      userId,
      { ...searchRequest, page: pageParam }
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
// MUTATIONS (unchanged)
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
    const previousData = queryClient.getQueryData<{ profile: any }>(queryKeys.profile.detail(userId))
    
    // Optimistically update follow status
    if (previousData) {
      queryClient.setQueryData<{ profile: any }>(queryKeys.profile.detail(userId), (old) => ({
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
    const previousData = queryClient.getQueryData<{ profile: any }>(queryKeys.profile.detail(userId))
    
    // Optimistically update follow status
    if (previousData) {
      queryClient.setQueryData<{ profile: any }>(queryKeys.profile.detail(userId), (old) => ({
        ...old!,
        profile: {
          ...old!.profile,
          is_following: false,
          follower_count: Math.max(0, old!.profile.follower_count - 1)
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
    queryClient.setQueryData<{ profile: any }>(queryKeys.profile.detail(userId), (old) => {
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
// SOCIAL QUERIES (FOLLOWERS/FOLLOWING)
// ========================================

/**
 * Get user followers with cursor-based pagination
 */
export function useUserFollowers(userId: string, limit: number = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.profile.followers(userId),
    queryFn: ({ pageParam }) => 
      ProfileService.getUserFollowersV1ProfileUserIdFollowersGet(
        userId,
        pageParam as string | undefined,
        limit
      ),
    initialPageParam: undefined,
    getNextPageParam: (lastPage: FollowerFollowingResponse) => {
      return lastPage.next_cursor || undefined
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get users that a user is following with cursor-based pagination
 */
export function useUserFollowing(userId: string, limit: number = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.profile.following(userId),
    queryFn: ({ pageParam }) => 
      ProfileService.getUserFollowingV1ProfileUserIdFollowingGet(
        userId,
        pageParam as string | undefined,
        limit
      ),
    initialPageParam: undefined,
    getNextPageParam: (lastPage: FollowerFollowingResponse) => {
      return lastPage.next_cursor || undefined
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}