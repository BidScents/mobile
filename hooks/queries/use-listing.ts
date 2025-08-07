import type {
  BidResponse,
  CommentResponse,
  FavoriteResponse,
  ListingDetailsResponse,
  SearchRequest,
  SearchResponse,
} from "@bid-scents/shared-sdk";
import { AuctionsService, ListingService, useAuthStore } from "@bid-scents/shared-sdk";
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
 * Vote listing mutation - UI updates handled locally in component
 */
export function useVoteListing() {
  return useMutation({
    mutationFn: ({
      listingId,
      isUpvote,
    }: {
      listingId: string;
      isUpvote: boolean;
    }) =>
      ListingService.voteListingV1ListingListingIdVotePost(listingId, isUpvote),
    // No invalidation - local state handles UI updates
  });
}

/**
 * Remove vote mutation - UI updates handled locally in component
 */
export function useUnvoteListing() {
  return useMutation({
    mutationFn: (listingId: string) =>
      ListingService.unvoteListingV1ListingListingIdUnvoteDelete(listingId),
    // No invalidation - local state handles UI updates
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
      listingId,
    }: {
      commentId: string;
      content: string;
      listingId: string;
    }) =>
      ListingService.updateCommentV1ListingCommentCommentIdPatch(commentId, {
        content,
      }),
    onMutate: async ({ commentId, content, listingId }) => {
      // Cancel outgoing queries for this listing
      await queryClient.cancelQueries({
        queryKey: queryKeys.listings.detail(listingId),
      });

      // Get current listing data
      const previousData = queryClient.getQueryData<ListingDetailsResponse>(
        queryKeys.listings.detail(listingId)
      );

      // Optimistically update the comment content
      if (previousData) {
        queryClient.setQueryData<ListingDetailsResponse>(
          queryKeys.listings.detail(listingId),
          (old) => {
            if (!old) return old;

            return {
              ...old,
              comments: old.comments?.map((comment) =>
                comment.id === commentId ? { ...comment, content } : comment
              ),
            };
          }
        );
      }

      return { previousData };
    },
    onSuccess: (response: CommentResponse, { listingId }) => {
      // Invalidate and refetch to get the real updated comment data from server
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
 * Delete comment mutation
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      listingId,
    }: {
      commentId: string;
      listingId: string;
    }) =>
      ListingService.deleteCommentV1ListingCommentCommentIdDelete(commentId),
    onMutate: async ({ commentId, listingId }) => {
      // Cancel outgoing queries for this listing
      await queryClient.cancelQueries({
        queryKey: queryKeys.listings.detail(listingId),
      });

      // Get current listing data
      const previousData = queryClient.getQueryData<ListingDetailsResponse>(
        queryKeys.listings.detail(listingId)
      );

      // Optimistically remove the comment
      if (previousData) {
        queryClient.setQueryData<ListingDetailsResponse>(
          queryKeys.listings.detail(listingId),
          (old) => {
            if (!old) return old;

            return {
              ...old,
              comments: old.comments?.filter(
                (comment) => comment.id !== commentId
              ),
            };
          }
        );
      }

      return { previousData };
    },
    onSuccess: (_, { listingId }) => {
      // Invalidate and refetch to ensure consistency
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

// ========================================
// BID MUTATIONS
// ========================================

/**
 * Place bid mutation with optimistic updates
 * Updates bid count and recent bids list optimistically for immediate feedback
 */
export function usePlaceBid() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({
      listingId,
      amount,
    }: {
      listingId: string;
      amount: number;
    }) =>
      AuctionsService.placeBidV1AuctionsListingIdBidPost(listingId, {
        amount,
      }),
    onMutate: async ({ listingId, amount }) => {
      // Cancel outgoing queries for this listing
      await queryClient.cancelQueries({
        queryKey: queryKeys.listings.detail(listingId),
      });

      // Get current listing data
      const previousData = queryClient.getQueryData<ListingDetailsResponse>(
        queryKeys.listings.detail(listingId)
      );

      // Create optimistic bid with current user data
      const optimisticBid = {
        id: `temp-${Date.now()}`, // Temporary ID
        amount,
        bidder: {
          id: user?.id || "current-user",
          username: user?.username || "You",
          profile_image_url: user?.profile_image_url || null,
        },
        created_at: new Date().toISOString(),
      };

      // Optimistically update listing detail with new bid
      if (previousData && previousData.auction_details) {
        queryClient.setQueryData<ListingDetailsResponse>(
          queryKeys.listings.detail(listingId),
          (old) => {
            if (!old || !old.auction_details) return old;

            return {
              ...old,
              auction_details: {
                ...old.auction_details,
                bid_count: (old.auction_details.bid_count || 0) + 1,
                bids: [optimisticBid, ...(old.auction_details.bids || []).slice(0, 4)],
              },
            };
          }
        );
      }

      return { previousData };
    },
    onSuccess: (response: BidResponse, { listingId }) => {
      // Invalidate and refetch to get the real bid data from server
      // This ensures we have the correct bid ID, timestamps, and any server-side updates
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
      // Also invalidate to ensure we have correct state
      queryClient.invalidateQueries({
        queryKey: queryKeys.listings.detail(listingId),
      });
    },
  });
}
