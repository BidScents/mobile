import type { CreateListingRequest, ListingResponse } from '@bid-scents/shared-sdk'
import { DashboardService, ProfileTab, useAuthStore } from '@bid-scents/shared-sdk'
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
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (request: CreateListingRequest): Promise<ListingResponse> => {
      return DashboardService.createListingV1DashboardListingPost(request)
    },
    
    onSuccess: (data) => {
      // Homepage invalidations (not needed as it can lead to many requests)
      // queryClient.invalidateQueries({ queryKey: queryKeys.homepage })
    
      // All listings invalidations (not needed as it can lead to many requests)
      // queryClient.invalidateQueries({ queryKey: queryKeys.listings.all })
    
      // All dashboard invalidations (covers all dashboard sub-queries)
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      
      // Profile invalidations: these are specific because we need the user ID
      if (user?.id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.profile.listings(user.id, ProfileTab.ACTIVE) 
        })
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.profile.listings(user.id, ProfileTab.FEATURED) 
        })
      }
      
      options?.onSuccess?.(data)
    },
    
    onError: (error: Error) => {
      // Call custom error handler if provided
      options?.onError?.(error)
    }
  })
}