import { useRef, useState } from 'react'
import { useAuthStore, TypingResData } from '@bid-scents/shared-sdk'
import { useMessagingWebSocket } from './use-messaging-websocket'
import { useMessagingWebSocketHandlers } from './use-messaging-websocket-handlers'
import { useTyping } from './use-typing'

/**
 * Configuration options for the real-time messaging hook
 */
interface UseMessagingRealtimeOptions {
  /** Whether the real-time connection should be enabled */
  enabled?: boolean
}

/**
 * Return type for the real-time messaging hook
 */
interface UseMessagingRealtimeReturn {
  /** Whether the WebSocket is currently connected */
  isConnected: boolean
  /** Typing management functions */
  typing: {
    /** Function to call when user starts typing */
    startTyping: (conversationId: string) => void
    /** Function to call when user stops typing */
    stopTyping: (conversationId: string) => void
    /** Function to call on text input changes */
    onTextChange: (conversationId: string, text: string) => void
  }
  /** Get typing users for a conversation */
  getTypingUsers: (conversationId: string) => TypingResData[]
  /** Force UI update (useful for typing indicators) */
  forceUpdate: () => void
}

/**
 * All-in-one hook for real-time messaging functionality.
 * 
 * This hook combines the messaging WebSocket, handlers, and typing functionality
 * into a single, easy-to-use interface. It handles all the real-time messaging
 * features including message updates, typing indicators, read receipts, and more.
 * 
 * Features:
 * - Automatic WebSocket connection management
 * - Real-time message updates with cache synchronization
 * - Typing indicator management with debouncing
 * - Read receipt handling
 * - Error handling and notifications
 * - Simple API for components to use
 * 
 * @param options Configuration object
 * @returns Object containing all real-time messaging functionality
 * 
 * @example
 * ```tsx
 * // In your main app component or messaging provider
 * const { isConnected, typing, getTypingUsers, forceUpdate } = useMessagingRealtime({
 *   enabled: !!user
 * })
 * 
 * // In your message input component
 * const handleTextChange = (text: string) => {
 *   typing.onTextChange(conversationId, text)
 *   setValue(text)
 * }
 * 
 * // In your conversation component
 * const typingUsers = getTypingUsers(conversationId)
 * const isOtherUserTyping = typingUsers.length > 0
 * 
 * // Your existing queries will automatically receive real-time updates:
 * const { data: conversation } = useConversation(conversationId) // Gets real-time message updates
 * const { data: summary } = useConversationSummary() // Gets real-time unread count updates
 * ```
 */
export function useMessagingRealtime({ 
  enabled = true 
}: UseMessagingRealtimeOptions = {}): UseMessagingRealtimeReturn {
  const { user } = useAuthStore()
  const [, forceUpdate] = useState({})
  
  // Store typing users per conversation
  const typingUsersRef = useRef<Record<string, TypingResData[]>>({})

  // Force update function for typing indicators
  const triggerUpdate = () => forceUpdate({})

  // Create WebSocket handlers
  const handlers = useMessagingWebSocketHandlers({
    currentUserId: user?.id,
    onUIUpdate: triggerUpdate,
    typingUsersRef
  })

  // Create WebSocket connection with handlers
  const { isConnected, sendTypingStatus } = useMessagingWebSocket({
    enabled: enabled && !!user,
    onConnect: handlers.handleConnect,
    onDisconnect: handlers.handleDisconnect,
    onMessage: handlers.handleMessage,
    onTyping: handlers.handleTyping,
    onUpdateLastRead: handlers.handleUpdateLastRead,
    onError: handlers.handleError
  })

  // Create typing management
  const typing = useTyping({
    sendTypingStatus,
    debounceMs: 1000 // 1 second debounce
  })

  /**
   * Get typing users for a specific conversation
   */
  const getTypingUsers = (conversationId: string): TypingResData[] => {
    return typingUsersRef.current[conversationId] || []
  }

  return {
    isConnected,
    typing,
    getTypingUsers,
    forceUpdate: triggerUpdate,
  }
}