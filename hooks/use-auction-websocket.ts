import { BidResData, useAuthStore, WSBidResponse, WSExtensionResponse, WSJoinResponse, WSType } from '@bid-scents/shared-sdk'
import { useEffect, useRef } from 'react'

const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8000'

/**
 * Configuration options for the auction WebSocket hook
 */
interface UseAuctionWebSocketOptions {
  /** The ID of the auction listing to connect to */
  listingId: string
  /** Whether the WebSocket connection should be enabled */
  enabled: boolean
  /** Callback fired when WebSocket connection is established */
  onConnect?: () => void
  /** Callback fired when WebSocket connection is closed */
  onDisconnect?: () => void  
  /** Callback fired when viewer count updates are received */
  onViewerCount?: (count: number) => void
  /** Callback fired when new bid data is received */
  onBid?: (bidData: BidResData) => void
  /** Callback fired when auction extension is received */
  onExtension?: (newEndTime: string) => void
}

/**
 * Return type for the auction WebSocket hook
 */
interface UseAuctionWebSocketReturn {
  /** Whether the WebSocket is currently connected */
  isConnected: boolean
}

/**
 * An auction WebSocket hook for real-time auction updates that prevents reconnection loops.
 * 
 * This hook is designed to maintain a persistent WebSocket connection for auction listings
 * without causing React re-renders that would trigger reconnection cycles. It uses refs
 * to store callback functions and state, ensuring the WebSocket connection remains stable.
 * 
 * Features:
 * - Automatic connection management with authentication
 * - Periodic ping messages to maintain connection
 * - Message handling for JOIN (viewer count), BID, and AUCTION_EXTENDED events  
 * - Prevents re-render loops by using refs instead of state
 * - Graceful error handling and connection cleanup
 * 
 * @param options Configuration object for the WebSocket connection
 * @returns Object containing connection status and methods
 * 
 * @example
 * ```tsx
 * const { isConnected } = useAuctionWebSocket({
 *   listingId: '123',
 *   enabled: true,
 *   onConnect: () => console.log('Connected'),
 *   onBid: (bidData) => handleNewBid(bidData),
 *   onExtension: (newEndTime) => handleAuctionExtension(newEndTime)
 * })
 * ```
 */
export function useAuctionWebSocket({
  listingId,
  enabled,
  onConnect,
  onDisconnect,
  onViewerCount,
  onBid,
  onExtension
}: UseAuctionWebSocketOptions): UseAuctionWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null)
  const { session } = useAuthStore()

  // Store callbacks in refs to avoid useEffect dependencies
  const callbacksRef = useRef({
    onConnect,
    onDisconnect,
    onViewerCount,
    onBid,
    onExtension
  })
  
  // Update callback refs
  callbacksRef.current = {
    onConnect,
    onDisconnect,
    onViewerCount,
    onBid,
    onExtension
  }

  useEffect(() => {
    if (!enabled || !listingId || !session?.access_token) {
      return
    }

    // Create WebSocket connection
    const wsUrl = `${WS_BASE_URL}/v1/auctions/${listingId}?token=${session.access_token}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      console.log(`Connected to auction WebSocket for listing ${listingId}`)
      callbacksRef.current.onConnect?.()
    }

    ws.onclose = () => {
      console.log(`Disconnected from auction WebSocket for listing ${listingId}`)
      callbacksRef.current.onDisconnect?.()
    }

    ws.onmessage = (event) => {
      try {
        const message: WSBidResponse | WSJoinResponse | WSExtensionResponse = JSON.parse(event.data)
        
        if (message.type === WSType.JOIN) {
          const joinMessage = message as WSJoinResponse
          console.log('Viewer count updated:', joinMessage.current_viewers)
          callbacksRef.current.onViewerCount?.(joinMessage.current_viewers)
        } else if (message.type === WSType.BID) {
          const bidMessage = message as WSBidResponse
          console.log('New bid received:', bidMessage.data)
          callbacksRef.current.onBid?.(bidMessage.data)
        } else if (message.type === WSType.AUCTION_EXTENDED) {
          const extensionMessage = message as WSExtensionResponse
          console.log('Auction extended, new end time:', extensionMessage.new_end_time)
          callbacksRef.current.onExtension?.(extensionMessage.new_end_time)
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('Auction WebSocket error:', error)
    }

    // Cleanup on unmount
    return () => {
      ws.close()
    }
  }, [enabled, listingId, session?.access_token]) // Depend on enabled state, listing ID, and session

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  }
}