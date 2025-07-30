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
      // 1. Homepage invalidations - new listings appear in homepage sections
      queryClient.invalidateQueries({ queryKey: queryKeys.homepage })

      // 2. General listings invalidations - affects listings page and search
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.search({}) })

      // 3. Dashboard invalidations - affects seller's dashboard
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.listings.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.listings.active })
      
      // 4. Profile invalidations - affects seller's profile listings
      if (user?.id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.profile.listings(user.id, ProfileTab.ACTIVE) 
        })
        
        // Also invalidate featured tab in case this is a featured listing
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.profile.listings(user.id, ProfileTab.FEATURED) 
        })
      }
      
      // Call custom success handler if provided
      options?.onSuccess?.(data)
    },
    
    onError: (error: Error) => {
      // Call custom error handler if provided
      options?.onError?.(error)
    }
  })
}