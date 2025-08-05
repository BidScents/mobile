import type {
  CommentResponse,
  FavoriteResponse,
  ListingDetailsResponse,
  SearchRequest,
  SearchResponse,
} from "@bid-scents/shared-sdk";
import { ListingService, useAuthStore } from "@bid-scents/shared-sdk";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

// ========================================
// LISTING DETAIL QUERIES
// ========================================

/**
 * Listing detail query - gets complete listing details including comments, votes, auction data
 * This is the main query for the listing detail screen
 */
export function useListingDetail(listingId: string) {
  return useQuery({
    queryKey: queryKeys.listings.detail(listingId),
    queryFn: () =>
      ListingService.getListingDetailsV1ListingListingIdDetailsGet(listingId),
    staleTime: 3 * 60 * 1000, // 3 minutes - listings can change frequently
    enabled: !!listingId,
  });
}

/**
 * User favorites query - gets all favorited listings for the current user
 */
export function useUserFavorites() {
  return useQuery({
    queryKey: queryKeys.listings.favorites,
    queryFn: () => ListingService.getUserFavoritesV1ListingFavoritesGet(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ========================================
// SEARCH QUERIES
// ========================================

/**
 * Search listings with infinite scroll support
 * Used for main search functionality and filtered results
 */
export function useSearchListings(searchParams: SearchRequest) {
  return useInfiniteQuery({
    queryKey: queryKeys.listings.search(searchParams),
    queryFn: ({ pageParam = 1 }) => {
      const requestWithPage = {
        ...searchParams,
        page: pageParam,
        per_page: searchParams.per_page || 20,
      };

      return ListingService.searchListingsV1ListingSearchPost(requestWithPage);
    },
    getNextPageParam: (lastPage: SearchResponse) => {
      const { page, total_pages } = lastPage.pagination_data;
      return page < total_pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes - search results change frequently
    // Prevent aggressive refetching for search results
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

/**
 * Basic search listings query (non-infinite) for simple searches
 * Useful for small result sets or when pagination isn't needed
 */
export function useSimpleSearchListings(searchParams: SearchRequest) {
  return useQuery({
    queryKey: queryKeys.listings.search(searchParams),
    queryFn: () =>
      ListingService.searchListingsV1ListingSearchPost(searchParams),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!searchParams.q || !!searchParams.filters, // Only search when there's actual search criteria
  });
}

// ========================================
// FAVORITE MUTATIONS
// ========================================

/**
 * Favorite listing mutation with optimistic updates
 * Updates both listing detail cache and favorites list cache
 */
export function useFavoriteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) =>
      ListingService.favoriteListingV1ListingListingIdFavoritePost(listingId),
    onMutate: async (listingId) => {
      // Cancel outgoing queries for this listing
      await queryClient.cancelQueries({
        queryKey: queryKeys.listings.detail(listingId),
      });

      // Get current listing data
      const previousData = queryClient.getQueryData<ListingDetailsResponse>(
        queryKeys.listings.detail(listingId)
      );

      // Optimistically update listing detail
      if (previousData) {
        queryClient.setQueryData<ListingDetailsResponse>(
          queryKeys.listings.detail(listingId),
          (old) => ({
            ...old!,
            favorites_count: old!.favorites_count + 1,
            // Note: Backend should include is_favorited in response for consistency
          })
        );
      }

      // Optimistically update any search results containing this listing
      queryClient.setQueriesData<SearchResponse>(
        { queryKey: queryKeys.listings.search({}) },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            listings: old.listings.map((listing) =>
              listing.id === listingId
                ? { ...listing, favorites_count: listing.favorites_count + 1 }
                : listing
            ),
          };
        }
      );

      return { previousData };
    },
    onSuccess: (response: FavoriteResponse, listingId) => {
      // Update with actual server response
      queryClient.setQueryData<ListingDetailsResponse>(
        queryKeys.listings.detail(listingId),
        (old) =>
          old
            ? {
                ...old,
                favorites_count: response.favorites_count,
              }
            : old
      );

      // Invalidate favorites list to refresh it
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.favorites });
    },
    onError: (err, listingId, context) => {
      // Rollback optimistic updates on error
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.listings.detail(listingId),
          context.previousData
        );
      }
      // Invalidate to refetch correct state
      queryClient.invalidateQueries({
        queryKey: queryKeys.listings.detail(listingId),
      });
    },
  });
}

/**
 * Unfavorite listing mutation with optimistic updates
 */
export function useUnfavoriteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) =>
      ListingService.unfavoriteListingV1ListingListingIdUnfavoriteDelete(
        listingId
      ),
    onMutate: async (listingId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.listings.detail(listingId),
      });

      // Get current data
      const previousData = queryClient.getQueryData<ListingDetailsResponse>(
        queryKeys.listings.detail(listingId)
      );

      // Optimistically update listing detail
      if (previousData) {
        queryClient.setQueryData<ListingDetailsResponse>(
          queryKeys.listings.detail(listingId),
          (old) => ({
            ...old!,
            favorites_count: Math.max(0, old!.favorites_count - 1),
          })
        );
      }

      // Optimistically update search results
      queryClient.setQueriesData<SearchResponse>(
        { queryKey: queryKeys.listings.search({}) },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            listings: old.listings.map((listing) =>
              listing.id === listingId
                ? {
                    ...listing,
                    favorites_count: Math.max(0, listing.favorites_count - 1),
                  }
                : listing
            ),
          };
        }
      );

      return { previousData };
    },
    onSuccess: (response: FavoriteResponse, listingId) => {
      // Update with server response
      queryClient.setQueryData<ListingDetailsResponse>(
        queryKeys.listings.detail(listingId),
        (old) =>
          old
            ? {
                ...old,
                favorites_count: response.favorites_count,
              }
            : old
      );

      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.favorites });
    },
    onError: (err, listingId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.listings.detail(listingId),
          context.previousData
        );
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.listings.detail(listingId),
      });
    },
  });
}

// ========================================
// VOTING MUTATIONS
// ========================================

/**
 * Vote listing mutation (upvote/downvote) with optimistic updates
 */
export function useVoteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      listingId,
      isUpvote,
    }: {
      listingId: string;
      isUpvote: boolean;
    }) =>
      ListingService.voteListingV1ListingListingIdVotePost(listingId, isUpvote),
    onMutate: async ({ listingId, isUpvote }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.listings.detail(listingId),
      });

      // Get current data
      const previousData = queryClient.getQueryData<ListingDetailsResponse>(
        queryKeys.listings.detail(listingId)
      );

      // Optimistically update vote
      if (previousData) {
        queryClient.setQueryData<ListingDetailsResponse>(
          queryKeys.listings.detail(listingId),
          (old) => {
            if (!old) return old;

            let voteDiff = 0;
            // If user had opposite vote, remove it and add new vote (+2 or -2)
            // If user had no vote, just add new vote (+1 or -1)
            if (old.is_upvoted === !isUpvote) {
              voteDiff = isUpvote ? 2 : -2;
            } else if (old.is_upvoted === null) {
              voteDiff = isUpvote ? 1 : -1;
            }

            return {
              ...old,
              total_votes: old.total_votes + voteDiff,
              is_upvoted: isUpvote,
            };
          }
        );
      }

      return { previousData };
    },
    onError: (err, { listingId }, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.listings.detail(listingId),
          context.previousData
        );
      }
    },
  });
}

/**
 * Remove vote mutation with optimistic updates
 */
export function useUnvoteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) =>
      ListingService.unvoteListingV1ListingListingIdUnvoteDelete(listingId),
    onMutate: async (listingId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.listings.detail(listingId),
      });

      // Get current data
      const previousData = queryClient.getQueryData<ListingDetailsResponse>(
        queryKeys.listings.detail(listingId)
      );

      // Optimistically remove vote
      if (previousData) {
        queryClient.setQueryData<ListingDetailsResponse>(
          queryKeys.listings.detail(listingId),
          (old) => {
            if (!old) return old;

            // Remove the current vote
            const voteDiff =
              old.is_upvoted === true ? -1 : old.is_upvoted === false ? 1 : 0;

            return {
              ...old,
              total_votes: old.total_votes + voteDiff,
              is_upvoted: null,
            };
          }
        );
      }

      return { previousData };
    },
    onError: (err, listingId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.listings.detail(listingId),
          context.previousData
        );
      }
    },
  });
}

// ========================================
// COMMENT MUTATIONS
// ========================================

/**
 * Add comment mutation with optimistic updates
 */
export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({
      listingId,
      content,
    }: {
      listingId: string;
      content: string;
    }) =>
      ListingService.addCommentV1ListingListingIdCommentPost(listingId, {
        content,
      }),
    onMutate: async ({ listingId, content }) => {
      // Cancel outgoing queries for this listing
      await queryClient.cancelQueries({
        queryKey: queryKeys.listings.detail(listingId),
      });

      // Get current listing data
      const previousData = queryClient.getQueryData<ListingDetailsResponse>(
        queryKeys.listings.detail(listingId)
      );

      // Create optimistic comment with real user data
      const optimisticComment = {
        id: `temp-${Date.now()}`, // Temporary ID
        content,
        created_at: new Date().toISOString(),
        commenter: {
          id: user?.id || "current-user",
          username: user?.username || "You",
          profile_image_url: user?.profile_image_url || null,
        },
      };

      // Optimistically update listing detail with new comment
      if (previousData) {
        queryClient.setQueryData<ListingDetailsResponse>(
          queryKeys.listings.detail(listingId),
          (old) => {
            if (!old) return old;

            return {
              ...old,
              comments: [optimisticComment, ...(old.comments || [])],
            };
          }
        );
      }

      return { previousData };
    },
    onSuccess: (response: CommentResponse, { listingId }) => {
      // Invalidate and refetch to get the real comment data from server
      // This ensures we have the correct comment ID, user data, timestamps, etc.
      queryClient.invalidateQueries({
        queryKey: queryKeys.listings.detail(listingId),
      });
    },
    onError: (err, { listingId }, context) => {
      // Rollback optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.listings.detail(listingId),
          context.previousData
        );
      }
    },
  });
}

/**
 * Update comment mutation
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) =>
      ListingService.updateCommentV1ListingCommentCommentIdPatch(commentId, {
        content,
      }),
    onSuccess: (response: CommentResponse, { commentId }) => {
      // Invalidate all listing details that might contain this comment
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
    },
  });
}

/**
 * Delete comment mutation
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      ListingService.deleteCommentV1ListingCommentCommentIdDelete(commentId),
    onSuccess: (_, commentId) => {
      // Invalidate all listing details that might contain this comment
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
    },
  });
}
