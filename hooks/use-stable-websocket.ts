import { useEffect, useRef } from 'react'
import { useAuthStore } from '@bid-scents/shared-sdk'

const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8000'

interface UseStableWebSocketOptions {
  listingId: string
  enabled: boolean
  onConnect?: () => void
  onDisconnect?: () => void  
  onViewerCount?: (count: number) => void
  onBid?: (bidData: any) => void
}

export function useStableWebSocket({
  listingId,
  enabled,
  onConnect,
  onDisconnect,
  onViewerCount,
  onBid
}: UseStableWebSocketOptions) {
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
      console.log(`✅ Connected to auction WebSocket for listing ${listingIdRef.current}`)
      onConnect?.()
      
      // Send initial ping
      ws.send(JSON.stringify({ type: 'ping' }))
      
      // Set up periodic pings
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }))
        }
      }, 30000)

      ws.onclose = () => {
        console.log(`❌ Disconnected from auction WebSocket for listing ${listingIdRef.current}`)
        clearInterval(pingInterval)
        onDisconnect?.()
      }
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        
        if (message.type === 'JOIN') {
          console.log('👥 Viewer count updated:', message.current_viewers)
          onViewerCount?.(message.current_viewers)
        } else if (message.type === 'BID') {
          console.log('💰 New bid received:', message.data)
          onBid?.(message.data)
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error(`🔥 Auction WebSocket error:`, error)
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