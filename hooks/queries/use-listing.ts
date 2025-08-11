import type {
  BidResponse,
  FavoriteResponse,
  HomepageResponse,
  ListingCard,
  ListingDetailsResponse,
  SearchRequest,
  SearchResponse
} from "@bid-scents/shared-sdk";
import { AuctionsService, ListingService, useAuthStore } from "@bid-scents/shared-sdk";
import {
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

// ========================================
// CACHE SEEDING HELPERS
// ========================================

/**
 * Transforms ListingCard data into a partial ListingDetailsResponse
 * Used to pre-populate detail cache for instant loading
 */
export function seedListingDetailCache(
  queryClient: QueryClient,
  listingCard: ListingCard
): void {
  const partialDetailResponse: ListingDetailsResponse & { __seeded?: boolean } = {
    listing: {
      id: listingCard.id,
      name: listingCard.name,
      brand: listingCard.brand,
      price: listingCard.price,
      volume: listingCard.volume,
      remaining_percentage: listingCard.remaining_percentage,
      listing_type: listingCard.listing_type,
      // Placeholder values for missing required fields  
      description: '', // Will be loaded by full query
      status: 'ACTIVE' as any, // Default assumption
      category: 'FRAGRANCE' as any, // Default assumption
      purchase_year: new Date().getFullYear(), // Default assumption
      box_condition: 'GOOD' as any, // Default assumption
      quantity: 1, // Default assumption
      batch_code: null,
    },
    seller: listingCard.seller,
    image_urls: listingCard.image_url ? [listingCard.image_url] : [],
    favorites_count: listingCard.favorites_count,
    total_votes: 0, // Will be loaded by full query
    is_upvoted: null, // Will be loaded by full query
    comments: null, // Will be loaded by full query
    auction_details: listingCard.listing_type === 'AUCTION' ? {
      id: `temp-${listingCard.id}`,
      listing_id: listingCard.id,
      current_bid: listingCard.current_bid || 0,
      bid_count: listingCard.bid_count || 0,
      ends_at: listingCard.ends_at || null,
      bids: [], // Will be loaded by full query
      is_extended: false,
      extension_count: 0,
      bid_increment: 0.5, // Default assumption
    } : null,
    // Marker to identify this as seeded data
    __seeded: true,
  } as ListingDetailsResponse;

  // Seed the cache with partial data
  queryClient.setQueryData(
    queryKeys.listings.detail(listingCard.id),
    partialDetailResponse
  );
  
  // Mark the seeded data as stale to ensure background refetch
  queryClient.invalidateQueries({
    queryKey: queryKeys.listings.detail(listingCard.id),
    refetchType: 'none' // Don't immediately refetch, just mark as stale
  });
}

// ========================================
// LISTING DETAIL QUERIES
// ========================================

/**
 * Listing detail query - gets complete listing details including comments, votes, auction data
 * This is the main query for the listing detail screen
 * Can be pre-seeded with ListingCard data for instant loading
 */
export function useListingDetail(listingId: string) {
  return useQuery({
    queryKey: queryKeys.listings.detail(listingId),
    queryFn: () =>
      ListingService.getListingDetailsV1ListingListingIdDetailsGet(listingId),
    staleTime: 3 * 60 * 1000, // 3 minutes - listings can change frequently
    enabled: !!listingId,
    // Background refetch will happen due to invalidation in cache seeding
  });
}

/**
 * User favorites query - gets all favorited listings for the current user
 */
export function useUserFavorites() {
  const query = useQuery({
    queryKey: queryKeys.listings.favorites,
    queryFn: () => ListingService.getUserFavoritesV1ListingFavoritesGet(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    ...query,
    data: query.data || [], // Ensure data is always an array
  };
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
    // Enable query for:
    // 1. Search with query text
    // 2. Filter-only search (empty query but has filters)
    // 3. Empty search to return all listings (no query and no filters)
    enabled: true,
  });
}

// ========================================
// FAVORITE CACHE HELPERS
// ========================================

/**
 * Helper function to update favorite count across all cache types
 * Ensures consistent favorite count synchronization everywhere
 */
function updateFavoriteCountInAllCaches(
  queryClient: QueryClient,
  listingId: string,
  newCount: number
) {

  // 1. Update favorites cache
  queryClient.setQueryData<any>(
    queryKeys.listings.favorites,
    (old: any) => {
      if (!old) return old;
      return (old || []).map((listing: any) =>
        listing.id === listingId
          ? { ...listing, favorites_count: newCount }
          : listing
      );
    }
  );

  // 2. Update listing detail cache
  queryClient.setQueryData<ListingDetailsResponse>(
    queryKeys.listings.detail(listingId),
    (old) =>
      old
        ? {
            ...old,
            favorites_count: newCount,
          }
        : old
  );

  // 3. Update homepage cache - all listing arrays
  queryClient.setQueryData<HomepageResponse>(
    queryKeys.homepage,
    (old) => {
      if (!old) return old;
      return {
        ...old,
        featured: (old.featured || []).map((listing) =>
          listing.id === listingId
            ? { ...listing, favorites_count: newCount }
            : listing
        ),
        recent_auctions: (old.recent_auctions || []).map((listing) =>
          listing.id === listingId
            ? { ...listing, favorites_count: newCount }
            : listing
        ),
        recent_listings: (old.recent_listings || []).map((listing) =>
          listing.id === listingId
            ? { ...listing, favorites_count: newCount }
            : listing
        ),
        sellers_you_follow: (old.sellers_you_follow || []).map((listing) =>
          listing.id === listingId
            ? { ...listing, favorites_count: newCount }
            : listing
        ),
        recent_swaps: (old.recent_swaps || []).map((listing) =>
          listing.id === listingId
            ? { ...listing, favorites_count: newCount }
            : listing
        ),
      };
    }
  );

  // 4. Update all search result caches
  queryClient.setQueriesData<SearchResponse>(
    { queryKey: queryKeys.listings.search({}) },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        listings: (old.listings || []).map((listing) =>
          listing.id === listingId
            ? { ...listing, favorites_count: newCount }
            : listing
        ),
      };
    }
  );

// 5. Update infinite search caches
  queryClient.setQueriesData<any>(
    { queryKey: queryKeys.listings.infiniteSearch({}) },
    (old: any) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: (old.pages || []).map((page: SearchResponse) => ({
          ...page,
          listings: (page.listings || []).map((listing) =>
            listing.id === listingId
              ? { ...listing, favorites_count: newCount }
              : listing
          ),
        })),
      };
    }
  );

}

// ========================================
// FAVORITE MUTATIONS
// ========================================

/**
 * Favorite listing mutation with optimistic updates
 * Updates favorite count across ALL cache types for consistency
 */
export function useFavoriteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) =>
      ListingService.favoriteListingV1ListingListingIdFavoritePost(listingId),
    onMutate: async (listingId) => {
      // Cancel outgoing queries to prevent race conditions
      await queryClient.cancelQueries({
        queryKey: queryKeys.listings.detail(listingId),
      });

      // Get current listing data for rollback
      const previousData = queryClient.getQueryData<ListingDetailsResponse>(
        queryKeys.listings.detail(listingId)
      );

      // Get current count for optimistic update
      const currentCount = previousData?.favorites_count ?? 0;
      
      // Optimistically increment count across ALL caches
      updateFavoriteCountInAllCaches(queryClient, listingId, currentCount + 1);

      return { previousData, previousCount: currentCount };
    },
    onSuccess: (response: FavoriteResponse, listingId) => {
      // Use server response to sync count across ALL caches
      updateFavoriteCountInAllCaches(queryClient, listingId, response.favorites_count);
      
      // Invalidate favorites list only to add/remove the listing itself
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.favorites });
    },
    onError: (err, listingId, context) => {
      // Rollback optimistic count update across ALL caches
      if (context?.previousCount !== undefined) {
        updateFavoriteCountInAllCaches(queryClient, listingId, context.previousCount);
      }
      
      // Rollback detail cache specifically
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
 * Unfavorite listing mutation with optimistic updates
 * Updates favorite count across ALL cache types for consistency
 */
export function useUnfavoriteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) =>
      ListingService.unfavoriteListingV1ListingListingIdUnfavoriteDelete(
        listingId
      ),
    onMutate: async (listingId) => {
      // Cancel outgoing queries to prevent race conditions
      await queryClient.cancelQueries({
        queryKey: queryKeys.listings.detail(listingId),
      });

      // Get current listing data for rollback
      const previousData = queryClient.getQueryData<ListingDetailsResponse>(
        queryKeys.listings.detail(listingId)
      );

      // Get current count for optimistic update
      const currentCount = previousData?.favorites_count ?? 0;
      
      // Optimistically decrement count across ALL caches
      updateFavoriteCountInAllCaches(queryClient, listingId, Math.max(0, currentCount - 1));

      return { previousData, previousCount: currentCount };
    },
    onSuccess: (response: FavoriteResponse, listingId) => {
      // Use server response to sync count across ALL caches
      updateFavoriteCountInAllCaches(queryClient, listingId, response.favorites_count);
      
      // Invalidate favorites list only to add/remove the listing itself
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.favorites });
    },
    onError: (err, listingId, context) => {
      // Rollback optimistic count update across ALL caches
      if (context?.previousCount !== undefined) {
        updateFavoriteCountInAllCaches(queryClient, listingId, context.previousCount);
      }
      
      // Rollback detail cache specifically
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
// VOTING MUTATIONS
// ========================================

/**
 * Vote listing mutation - updates both local state and detailed listing cache
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
    onSuccess: (_, { listingId, isUpvote }) => {
      // Update the detailed listing cache with server response
      queryClient.setQueryData<ListingDetailsResponse>(
        queryKeys.listings.detail(listingId),
        (old) => {
          if (!old) return old;
          
          // Calculate vote change based on current state
          let voteChange = 0;
          if (old.is_upvoted === null) {
            // No previous vote
            voteChange = isUpvote ? 1 : -1;
          } else if (old.is_upvoted === true) {
            // Had upvote, changing to downvote
            voteChange = isUpvote ? 0 : -2; // Remove upvote + add downvote
          } else {
            // Had downvote, changing to upvote  
            voteChange = isUpvote ? 2 : 0; // Remove downvote + add upvote
          }
          
          return {
            ...old,
            total_votes: old.total_votes + voteChange,
            is_upvoted: isUpvote,
          };
        }
      );
    },
  });
}

/**
 * Remove vote mutation - updates both local state and detailed listing cache
 */
export function useUnvoteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) =>
      ListingService.unvoteListingV1ListingListingIdUnvoteDelete(listingId),
    onSuccess: (_, listingId) => {
      // Update the detailed listing cache with server response
      queryClient.setQueryData<ListingDetailsResponse>(
        queryKeys.listings.detail(listingId),
        (old) => {
          if (!old) return old;
          
          // Calculate vote change - remove current vote
          const voteChange = old.is_upvoted === true ? -1 : old.is_upvoted === false ? 1 : 0;
          
          return {
            ...old,
            total_votes: old.total_votes + voteChange,
            is_upvoted: null,
          };
        }
      );
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
    mutationFn: async ({
      listingId,
      amount,
    }: {
      listingId: string;
      amount: number;
    }) => {
      try {
        const response = await AuctionsService.placeBidV1AuctionsListingIdBidPost(listingId, {
          amount,
        });
        console.log("✅ Bid placed successfully:", amount);
        return response;
      } catch (error: any) {
        console.log("❌ API bid failed:", error?.body?.detail || error?.message);
        throw error; // Re-throw to maintain error handling flow
      }
    },
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
