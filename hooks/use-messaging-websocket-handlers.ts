import {
  ConversationResponse,
  ErrorResData,
  MessageResData,
  MessagesSummary,
  TypingResData,
  UpdateLastReadData,
  useAuthStore
} from '@bid-scents/shared-sdk'
import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import * as Notifications from 'expo-notifications'
import { useCallback } from 'react'
import { queryKeys } from './queries/query-keys'
import { updateAllMessageCaches, } from './queries/use-messages'

/**
 * Configuration options for messaging WebSocket handlers
 */
interface UseMessagingWebSocketHandlersOptions {
  /** Current user ID to filter out own messages and typing indicators */
  currentUserId?: string
  /** Callback for UI updates (typing indicators, etc.) */
  onUIUpdate?: () => void
  /** Reference to store typing users per conversation */
  typingUsersRef?: React.MutableRefObject<Record<string, TypingResData[]>>
}

/**
 * Return type for the messaging WebSocket handlers hook
 */
interface UseMessagingWebSocketHandlersReturn {
  /** Handler for WebSocket connection establishment */
  handleConnect: () => void
  /** Handler for WebSocket connection termination */
  handleDisconnect: () => void
  /** Handler for new message updates */
  handleMessage: (messageData: MessageResData) => Promise<void>
  /** Handler for typing indicator updates */
  handleTyping: (typingData: TypingResData) => void
  /** Handler for last read updates */
  handleUpdateLastRead: (updateData: UpdateLastReadData) => void
  /** Handler for WebSocket errors */
  handleError: (errorData: ErrorResData) => void
}

/**
 * Custom hook that provides modular handlers for messaging WebSocket events.
 * 
 * This hook encapsulates the business logic for handling messaging WebSocket events
 * including new messages, typing indicators, read receipts, errors, and notifications.
 * It provides optimistic cache updates, haptic feedback, and proper user experience.
 * 
 * Features:
 * - Seamless integration with existing TanStack Query caches
 * - Real-time message updates with optimistic UI
 * - Typing indicator management per conversation
 * - Read receipt handling with unread count updates
 * - Error handling with user feedback
 * - Push notification handling
 * - Haptic feedback for important events
 * 
 * @param options Configuration object for the handlers
 * @returns Object containing event handler functions
 * 
 * @example
 * ```tsx
 * const handlers = useMessagingWebSocketHandlers({
 *   currentUserId: user?.id,
 *   onUIUpdate: () => forceUpdate(),
 *   typingUsersRef
 * })
 * 
 * // Use with WebSocket hook
 * useMessagingWebSocket({
 *   enabled: !!user,
 *   onMessage: handlers.handleMessage,
 *   onTyping: handlers.handleTyping,
 *   onUpdateLastRead: handlers.handleUpdateLastRead,
 *   onError: handlers.handleError,
 *   onNotification: handlers.handleNotification
 * })
 * ```
 */
export function useMessagingWebSocketHandlers({
  currentUserId,
  onUIUpdate,
  typingUsersRef
}: UseMessagingWebSocketHandlersOptions): UseMessagingWebSocketHandlersReturn {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  /**
   * Handles connection establishment
   */
  const handleConnect = useCallback(() => {
    console.log('Messaging WebSocket connected')
    // Could trigger a UI update to show "connected" status
  }, [])

  /**
   * Handles connection termination
   */
  const handleDisconnect = useCallback(() => {
    console.log('Messaging WebSocket disconnected')
    // Clear typing indicators on disconnect
    if (typingUsersRef) {
      typingUsersRef.current = {}
      onUIUpdate?.()
    }
  }, [typingUsersRef, onUIUpdate])

  /**
   * Handles new message updates with optimistic cache updates
   */
  const handleMessage = useCallback(async (messageData: MessageResData) => {
    console.log('New message received via WebSocket:', messageData)

    // Only provide haptic feedback for messages from other users
    if (messageData.sender?.id !== currentUserId) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    const conversationId = messageData.conversation_id

    // Check for duplicates in conversation cache before updating
    const existingConversation = queryClient.getQueryData<ConversationResponse>(
      queryKeys.messages.conversation(conversationId)
    )
    
    const existingMessage = existingConversation?.messages.find(msg => msg.id === messageData.id)
    if (existingMessage) {
      // Message exists - check if it's different (updated) or identical (duplicate)
      const isDifferent = JSON.stringify(existingMessage) !== JSON.stringify(messageData)
      if (isDifferent) {
        console.log('Message updated via WebSocket, updating cache')
        updateAllMessageCaches(queryClient, conversationId, messageData, true)
      } else {
        console.log('Message already exists in cache with same content, skipping WebSocket update')
      }
      return
    }

    // Message doesn't exist - determine add vs update based on message type
    // ACTION/SYSTEM messages should update existing if same ID, TEXT/FILE should add as new
    const isActionOrSystem = messageData.content_type === 'ACTION' || messageData.content_type === 'SYSTEM'
    
    if (isActionOrSystem) {
      // For ACTION/SYSTEM messages, always try to update first
      updateAllMessageCaches(queryClient, conversationId, messageData)
    } else {
      // For TEXT/FILE messages, always add as new
      updateAllMessageCaches(queryClient, conversationId, messageData)
    }

    // Update participant read status and unread counts
    queryClient.setQueryData<ConversationResponse>(
      queryKeys.messages.conversation(conversationId),
      (old) => {
        if (!old) return old
        return {
          ...old,
          participants: old.participants.map((participant) => {
            if (participant.user.id === messageData.sender.id) {
              return {
                ...participant,
                last_read_at: messageData.created_at,
              }
            }
            return participant
          }),
        }
      }
    )

    // Update conversation summary unread counts
    queryClient.setQueryData<MessagesSummary>(
      queryKeys.messages.summary,
      (old) => {
        if (!old) return old
        
        return {
          ...old,
          total_unread: old.total_unread + 1, // Increment total unread
          conversations: old.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  unread_count: conv.unread_count + 1, // Increment conversation unread
                }
              : conv
          ),
        }
      }
    )

    // 4. Clear typing indicator for sender if they were typing
    if (typingUsersRef?.current[conversationId]) {
      typingUsersRef.current[conversationId] = typingUsersRef.current[conversationId].filter(
        typing => typing.user.id !== messageData.sender.id
      )
      onUIUpdate?.()
    }

    // 5. Show notification for new message (only if not from current user)
    if (messageData.sender?.id !== currentUserId) {
      const getNotificationBody = () => {
        if (!messageData.content) {
          return 'Sent a message'
        }
        
        if (typeof messageData.content === 'object' && 'text' in messageData.content) {
          return (messageData.content as any).text || 'Sent a message'
        }
        
        return 'Sent a message'
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: messageData.sender.username || 'New Message',
          body: getNotificationBody(),
          sound: true,
        },
        trigger: null, // Show immediately
      })
    }
  }, [currentUserId, queryClient, typingUsersRef, onUIUpdate])

  /**
   * Handles typing indicator updates
   */
  const handleTyping = useCallback((typingData: TypingResData) => {
    // Skip processing if it's the current user's own typing indicator
    if (typingData.user?.id === currentUserId) {
      return
    }

    console.log('Typing indicator received:', typingData)

    if (!typingUsersRef) return

    const conversationId = typingData.conversation_id
    
    if (!typingUsersRef.current[conversationId]) {
      typingUsersRef.current[conversationId] = []
    }

    if (typingData.is_typing) {
      // Add user to typing list if not already there
      const existingIndex = typingUsersRef.current[conversationId].findIndex(
        typing => typing.user.id === typingData.user.id
      )
      
      if (existingIndex === -1) {
        typingUsersRef.current[conversationId].push(typingData)
      } else {
        // Update existing typing data
        typingUsersRef.current[conversationId][existingIndex] = typingData
      }
    } else {
      // Remove user from typing list
      typingUsersRef.current[conversationId] = typingUsersRef.current[conversationId].filter(
        typing => typing.user.id !== typingData.user.id
      )
    }

    // Trigger UI update for typing indicators
    onUIUpdate?.()
  }, [currentUserId, typingUsersRef, onUIUpdate])

  /**
   * Handles last read updates with cache synchronization
   */
  const handleUpdateLastRead = useCallback((updateData: UpdateLastReadData) => {
    console.log('Last read update received:', updateData)

    const conversationId = updateData.conversation_id
    const userId = updateData.user_id
    const lastReadAt = updateData.last_read_at

    // Update the conversation cache to update participant's last_read_at
    queryClient.setQueryData<ConversationResponse>(
      queryKeys.messages.conversation(conversationId),
      (old) => {
        if (!old) return old
        
        return {
          ...old,
          participants: old.participants.map((participant) => {
            if (participant.user.id === userId) {
              return {
                ...participant,
                last_read_at: lastReadAt
              }
            }
            return participant
          })
        }
      }
    )
  }, [queryClient])

  /**
   * Handles WebSocket errors
   */
  const handleError = useCallback((errorData: ErrorResData) => {
    console.error('WebSocket error received:', errorData)
    
    // Could show error toast or handle specific error types
    // For now, just log the error
  }, [])

  return {
    handleConnect,
    handleDisconnect,
    handleMessage,
    handleTyping,
    handleUpdateLastRead,
    handleError,
  }
}