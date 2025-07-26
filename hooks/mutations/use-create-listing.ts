import type { CreateListingRequest, ListingResponse } from '@bid-scents/shared-sdk'
import { DashboardService } from '@bid-scents/shared-sdk'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/query-keys'

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
      // Invalidate and refetch relevant queries using your query key structure
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.listings.all })

      // Call custom success handler if provided
      options?.onSuccess?.(data)
    },
    
    onError: (error: Error) => {
      // Call custom error handler if provided
      options?.onError?.(error)
    }
  })
}
