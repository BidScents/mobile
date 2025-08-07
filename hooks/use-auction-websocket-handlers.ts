import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Notifications from 'expo-notifications'
import { ListingDetailsResponse, BidResData } from '@bid-scents/shared-sdk'
import { queryKeys } from './queries/query-keys'

/**
 * Configuration options for auction WebSocket handlers
 */
interface UseAuctionWebSocketHandlersOptions {
  /** The ID of the auction listing */
  listingId: string
  /** Current user ID to skip notifications for own bids */
  currentUserId?: string
  /** Callback to force UI update for viewer count */
  onUIUpdate?: () => void
  /** Reference to store viewer count */
  viewerCountRef?: React.MutableRefObject<number | undefined>
}

/**
 * Return type for the auction WebSocket handlers hook
 */
interface UseAuctionWebSocketHandlersReturn {
  /** Handler for WebSocket connection establishment */
  handleConnect: () => void
  /** Handler for WebSocket connection termination */
  handleDisconnect: () => void
  /** Handler for viewer count updates */
  handleViewerCount: (count: number) => void
  /** Handler for new bid updates */
  handleBid: (bidData: BidResData) => Promise<void>
}

/**
 * Custom hook that provides modular handlers for auction WebSocket events.
 * 
 * This hook encapsulates the business logic for handling auction WebSocket events
 * including viewer count updates and new bid processing. It provides optimistic
 * cache updates, haptic feedback, and toast notifications.
 * 
 * @param options Configuration object for the handlers
 * @returns Object containing event handler functions
 */
export function useAuctionWebSocketHandlers({
  listingId,
  currentUserId,
  onUIUpdate,
  viewerCountRef
}: UseAuctionWebSocketHandlersOptions): UseAuctionWebSocketHandlersReturn {
  const queryClient = useQueryClient()

  /**
   * Handles connection establishment
   */
  const handleConnect = useCallback(() => {
    console.log('Auction WebSocket connected')
  }, [])

  /**
   * Handles connection termination
   */
  const handleDisconnect = useCallback(() => {
    console.log('Auction WebSocket disconnected')
  }, [])

  /**
   * Handles viewer count updates from JOIN messages
   */
  const handleViewerCount = useCallback((count: number) => {
    console.log('Viewer count updated:', count)
    if (viewerCountRef) {
      viewerCountRef.current = count
    }
    onUIUpdate?.()
  }, [viewerCountRef, onUIUpdate])

  /**
   * Handles new bid updates with optimistic cache updates and user feedback
   */
  const handleBid = useCallback(async (bidData: BidResData) => {
    console.log('New bid received:', bidData)

    // Skip processing if it's the current user's own bid
    if (bidData.bidder?.id === currentUserId) {
      return
    }

    // Provide haptic feedback for new bid
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    // Optimistically update cache with new bid data
    queryClient.setQueryData<ListingDetailsResponse>(
      queryKeys.listings.detail(listingId),
      (old) => {
        if (!old || !old.auction_details) return old

        return {
          ...old,
          auction_details: {
            ...old.auction_details,
            bid_count: bidData.bid_count,
            bids: bidData ? [
              {
                id: bidData.id,
                amount: bidData.amount,
                bidder: bidData.bidder,
                created_at: bidData.created_at,
              },
              // Keep only the 4 most recent previous bids
              ...(old.auction_details.bids || []).slice(0, 4),
            ] : old.auction_details.bids,
          },
        }
      }
    )

    // Show toast notification for new bid
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'New Bid!',
        body: `${bidData.bidder?.username || 'Someone'} bid $${bidData.amount}`,
        sound: false, // Haptic feedback already provided
      },
      trigger: null, // Show immediately
    })
  }, [currentUserId, queryClient, listingId])

  return {
    handleConnect,
    handleDisconnect,
    handleViewerCount,
    handleBid,
  }
}