import type {
  CreateListingRequest,
  DashboardAuctionResponse,
  ListingResponse,
  MessageResData,
  SellerTransactionData,
  TransactionResponse,
  UpdateListingRequest
} from '@bid-scents/shared-sdk'
import { DashboardService } from '@bid-scents/shared-sdk'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './query-keys'

// ========================================
// QUERY HOOKS
// ========================================

/**
 * Get user's pending auctions with infinite scroll pagination
 */
export function usePendingAuctions(perPage: number = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.dashboard.auctions,
    queryFn: ({ pageParam = 1 }) => {
      return DashboardService.getPendingAuctionsV1DashboardAuctionsGet(pageParam, perPage)
    },
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination_data
      return page < total_pages ? page + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchOnMount: "always"
  })
}

/**
 * Get settlement details for a specific auction
 */
export function useSettlementDetails(listingId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.dashboard.settlement(listingId),
    queryFn: () => DashboardService.getSettlementDetailsV1DashboardAuctionsListingIdGet(listingId),
    enabled: !!listingId && (options?.enabled ?? true),
    staleTime: 1 * 60 * 1000, // 1 minute (more frequent updates for active auctions)
    refetchOnMount: "always"
  })
}

/**
 * Get user's active listings with infinite scroll pagination
 */
export function useActiveListings(perPage: number = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.dashboard.listings.active,
    queryFn: ({ pageParam = 1 }) => {
      return DashboardService.getActiveListingsV1DashboardListingsActiveGet(perPage, pageParam)
    },
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination_data
      return page < total_pages ? page + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchOnMount: "always"
  })
}

/**
 * Get user's featured listings with infinite scroll pagination
 */
export function useFeaturedListings(perPage: number = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.dashboard.listings.featured,
    queryFn: ({ pageParam = 1 }) => {
      return DashboardService.getFeaturedListingsV1DashboardListingsFeaturedGet(perPage, pageParam)
    },
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination_data
      return page < total_pages ? page + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchOnMount: "always"
  })
}

/**
 * Get user's transactions with cursor-based pagination
 */
export function useUserTransactions(limit: number = 20) {
  return useInfiniteQuery({
    queryKey: queryKeys.dashboard.transactions,
    queryFn: ({ pageParam }) => {
      const cursorToUse = pageParam || new Date().toISOString();
      return DashboardService.getUserTransactionsV1DashboardTransactionsGet(cursorToUse, limit)
    },
    getNextPageParam: (lastPage: TransactionResponse) => {
      const transactions = lastPage.transactions || []
      if (transactions.length < limit) return undefined
      // Use the last transaction's updated_at timestamp as cursor
      const lastTransaction: SellerTransactionData = transactions[transactions.length - 1]
      return lastTransaction?.updated_at
    },
    initialPageParam: undefined,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: "always"
  })
}

// ========================================
// MUTATION HOOKS
// ========================================

interface UseCreateListingOptions {
  onSuccess?: (data: ListingResponse) => void
  onError?: (error: Error) => void
}

/**
 * Custom hook for creating a new listing.
 * 
 * Provides mutation state management and optimistic updates.
 * Invalidates relevant queries on success to keep data fresh.
 */
export function useCreateListing(options?: UseCreateListingOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateListingRequest): Promise<ListingResponse> => {
      return DashboardService.createListingV1DashboardListingPost(request)
    },
    
    onSuccess: (data) => {
      // All dashboard invalidations (covers all dashboard sub-queries)
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      
      // Messages invalidations
      queryClient.invalidateQueries({ queryKey: ['profile', 'listings'] })
      
      options?.onSuccess?.(data)
    },
    
    onError: (error: Error) => {
      options?.onError?.(error)
    }
  })
}

/**
 * Update an existing listing with optimistic updates
 */
export function useUpdateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ listingId, request }: { listingId: string; request: UpdateListingRequest }): Promise<ListingResponse> => {
      return DashboardService.updateListingV1DashboardListingListingIdPatch(listingId, request)
    },
    
    onSuccess: (data, { listingId }) => {
      // invalidate specific listing cache
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(listingId) })
      
      // Invalidate dashboard data
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      
      // Invalidate profile listings
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all })
    }
  })
}

/**
 * Delete a listing with cache invalidation
 */
export function useDeleteListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (listingId: string): Promise<void> => {
      return DashboardService.deleteListingV1DashboardListingListingIdDelete(listingId)
    },
    
    onSuccess: (_, listingId) => {
      // Remove from specific listing cache
      queryClient.removeQueries({ queryKey: queryKeys.listings.detail(listingId) })
      
      // Invalidate dashboard data
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      
      // Invalidate profile listings
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all })
    }
  })
}

/**
 * Settle auction transaction - sends transaction message to highest bidder
 */
export function useSettleAuctionTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (listingId: string): Promise<MessageResData> => {
      return DashboardService.settleAuctionTransactionV1DashboardAuctionsListingIdTransactionPost(listingId)
    },
    
    onSuccess: (data, listingId) => {
      // Invalidate settlement details for this auction
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.settlement(listingId) })
      
      // Invalidate messages (new transaction message created)
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all })
      
      // Invalidate dashboard auctions
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.auctions })
    }
  })
}

/**
 * Mark highest bidder as no response
 */
export function useMarkNoResponse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (listingId: string): Promise<DashboardAuctionResponse> => {
      return DashboardService.markNoResponseV1DashboardAuctionsListingIdNoResponsePost(listingId)
    },
    
    onSuccess: (data, listingId) => {
      // Update settlement details cache with new data
      queryClient.setQueryData(queryKeys.dashboard.settlement(listingId), data)
      
      // Invalidate dashboard auctions
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.auctions })
      
      // Invalidate messages (message marked as inactive)
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all })
    }
  })
}