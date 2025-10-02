import {
  ErrorResData,
  MessageResData,
  TypingResData,
  UpdateLastReadData,
  useAuthStore,
  WSMessageResponse,
  WSType
} from '@bid-scents/shared-sdk'
import { useEffect, useRef } from 'react'

const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8000'

/**
 * Configuration options for the messaging WebSocket hook
 */
interface UseMessagingWebSocketOptions {
  /** Whether the WebSocket connection should be enabled */
  enabled: boolean
  /** Callback fired when WebSocket connection is established */
  onConnect?: () => void
  /** Callback fired when WebSocket connection is closed */
  onDisconnect?: () => void
  /** Callback fired when new message is received */
  onMessage?: (messageData: MessageResData) => void
  /** Callback fired when message update is received */
  onUpdateMessage?: (messageData: MessageResData) => void
  /** Callback fired when typing indicator is received */
  onTyping?: (typingData: TypingResData) => void
  /** Callback fired when last read update is received */
  onUpdateLastRead?: (updateData: UpdateLastReadData) => void
  /** Callback fired when error is received */
  onError?: (errorData: ErrorResData) => void
}

/**
 * Return type for the messaging WebSocket hook
 */
interface UseMessagingWebSocketReturn {
  /** Whether the WebSocket is currently connected */
  isConnected: boolean
  /** Function to send typing status */
  sendTypingStatus: (conversationId: string, isTyping: boolean) => void
}

/**
 * A messaging WebSocket hook for real-time messaging updates.
 * 
 * This hook maintains a persistent WebSocket connection for messaging features
 * without causing React re-renders that would trigger reconnection cycles. It uses refs
 * to store callback functions and state, ensuring the WebSocket connection remains stable.
 * 
 * Features:
 * - Global persistent connection for all messaging features
 * - Automatic connection management with authentication
 * - Periodic ping messages to maintain connection
 * - Message handling for MESSAGE, TYPING, UPDATE_LAST_READ, ERROR, and NOTIFICATION events
 * - Prevents re-render loops by using refs instead of state
 * - Graceful error handling and connection cleanup
 * - Typing status sending functionality
 * 
 * @param options Configuration object for the WebSocket connection
 * @returns Object containing connection status and utility functions
 * 
 * @example
 * ```tsx
 * const { isConnected, sendTypingStatus } = useMessagingWebSocket({
 *   enabled: !!user,
 *   onConnect: () => console.log('Connected to messaging'),
 *   onMessage: (messageData) => handleNewMessage(messageData),
 *   onTyping: (typingData) => handleTypingIndicator(typingData),
 *   onUpdateLastRead: (updateData) => handleReadReceipt(updateData)
 * })
 * 
 * // Send typing status
 * sendTypingStatus(conversationId, true) // Start typing
 * sendTypingStatus(conversationId, false) // Stop typing
 * ```
 */
export function useMessagingWebSocket({
  enabled,
  onConnect,
  onDisconnect,
  onMessage,
  onUpdateMessage,
  onTyping,
  onUpdateLastRead,
  onError
}: UseMessagingWebSocketOptions): UseMessagingWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null)
  const { session } = useAuthStore()

  // Store callbacks in refs to avoid useEffect dependencies
  const callbacksRef = useRef({
    onConnect,
    onDisconnect,
    onMessage,
    onUpdateMessage,
    onTyping,
    onUpdateLastRead,
    onError
  })
  
  // Update callback refs
  callbacksRef.current = {
    onConnect,
    onDisconnect,
    onMessage,
    onUpdateMessage,
    onTyping,
    onUpdateLastRead,
    onError
  }

  useEffect(() => {
    if (!enabled || !session?.access_token) {
      return
    }

    // Create WebSocket connection without token in URL
    const wsUrl = `${WS_BASE_URL}/v1/message`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('Connected to messaging WebSocket')
      // Send JWT token as first message (backend expects plain token string)
      ws.send(session.access_token)
      // Trigger onConnect after sending auth
      callbacksRef.current.onConnect?.()
    }

    ws.onclose = () => {
      console.log('Disconnected from messaging WebSocket')
      callbacksRef.current.onDisconnect?.()
    }

    ws.onmessage = (event) => {
      try {
        const message: WSMessageResponse = JSON.parse(event.data)
        
        switch (message.type) {
          case WSType.MESSAGE: {
            const messageData = message.data as MessageResData
            console.log('New message received:', messageData)
            callbacksRef.current.onMessage?.(messageData)
            break
          }
          
          case WSType.UPDATE_MESSAGE: {
            const messageData = message.data as MessageResData
            console.log('Message update received:', messageData)
            callbacksRef.current.onUpdateMessage?.(messageData)
            break
          }
          
          case WSType.TYPING: {
            const typingData = message.data as TypingResData
            console.log('Typing indicator received:', typingData)
            callbacksRef.current.onTyping?.(typingData)
            break
          }
          
          case WSType.UPDATE_LAST_READ: {
            const updateData = message.data as UpdateLastReadData
            console.log('Last read update received:', updateData)
            callbacksRef.current.onUpdateLastRead?.(updateData)
            break
          }
          
          case WSType.ERROR: {
            const errorData = message.data as ErrorResData
            console.error('WebSocket error received:', errorData)
            callbacksRef.current.onError?.(errorData)
            break
          }
          
          case WSType.NOTIFICATION: {
            // Notifications are handled through a different system (push notifications)
            // This WebSocket only handles messaging-specific real-time updates
            console.log('Notification type received (handled separately):', message.data)
            break
          }
          
          default:
            console.log('Unknown message type:', message.type)
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('Messaging WebSocket error:', error)
    }

    // Cleanup on unmount
    return () => {
      ws.close()
    }
  }, [enabled, session?.access_token]) // Depend on enabled state and session

  /**
   * Sends typing status for a specific conversation
   */
  const sendTypingStatus = (conversationId: string, isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const typingMessage = {
        type: WSType.TYPING,
        data: {
          conversation_id: conversationId,
          is_typing: isTyping
        }
      }
      
      wsRef.current.send(JSON.stringify(typingMessage))
      console.log(`Sent typing status for conversation ${conversationId}:`, isTyping)
    } else {
      console.warn('WebSocket not connected, cannot send typing status')
    }
  }

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    sendTypingStatus
  }
}