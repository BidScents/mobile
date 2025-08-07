import { useAuthStore } from '@bid-scents/shared-sdk'
import { useEffect, useRef } from 'react'

const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8000'

/**
 * Configuration options for the stable WebSocket hook
 */
interface UseStableWebSocketOptions {
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
  onBid?: (bidData: any) => void
}

/**
 * Return type for the stable WebSocket hook
 */
interface UseStableWebSocketReturn {
  /** Whether the WebSocket is currently connected */
  isConnected: boolean
}

/**
 * A stable WebSocket hook for real-time auction updates that prevents reconnection loops.
 * 
 * This hook is designed to maintain a persistent WebSocket connection for auction listings
 * without causing React re-renders that would trigger reconnection cycles. It uses refs
 * to store callback functions and state, ensuring the WebSocket connection remains stable.
 * 
 * Features:
 * - Automatic connection management with authentication
 * - Periodic ping messages to maintain connection
 * - Message handling for JOIN (viewer count) and BID events  
 * - Prevents re-render loops by using refs instead of state
 * - Graceful error handling and connection cleanup
 * 
 * @param options Configuration object for the WebSocket connection
 * @returns Object containing connection status and methods
 * 
 * @example
 * ```tsx
 * const { isConnected } = useStableWebSocket({
 *   listingId: '123',
 *   enabled: true,
 *   onConnect: () => console.log('Connected'),
 *   onBid: (bidData) => handleNewBid(bidData)
 * })
 * ```
 */
export function useStableWebSocket({
  listingId,
  enabled,
  onConnect,
  onDisconnect,
  onViewerCount,
  onBid
}: UseStableWebSocketOptions): UseStableWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null)
  const enabledRef = useRef(enabled)
  const listingIdRef = useRef(listingId)
  const { session } = useAuthStore()

  // Update refs without causing re-renders
  enabledRef.current = enabled
  listingIdRef.current = listingId

  useEffect(() => {
    if (!enabledRef.current || !listingIdRef.current || !session?.access_token) {
      return
    }

    // Create WebSocket connection
    const wsUrl = `${WS_BASE_URL}/v1/auctions/${listingIdRef.current}?token=${session.access_token}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      console.log(`Connected to auction WebSocket for listing ${listingIdRef.current}`)
      onConnect?.()
      
      // Send initial ping to maintain connection
      ws.send(JSON.stringify({ type: 'ping' }))
      
      // Set up periodic pings every 30 seconds
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }))
        }
      }, 30000)

      ws.onclose = () => {
        console.log(`Disconnected from auction WebSocket for listing ${listingIdRef.current}`)
        clearInterval(pingInterval)
        onDisconnect?.()
      }
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        
        if (message.type === 'JOIN') {
          console.log('Viewer count updated:', message.current_viewers)
          onViewerCount?.(message.current_viewers)
        } else if (message.type === 'BID') {
          console.log('New bid received:', message.data)
          onBid?.(message.data)
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
  }, [session?.access_token]) // Only depend on session, nothing else

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  }
}