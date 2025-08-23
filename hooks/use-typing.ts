import { useCallback, useRef } from 'react'

/**
 * Configuration options for the typing hook
 */
interface UseTypingOptions {
  /** Function to send typing status (from WebSocket hook) */
  sendTypingStatus: (conversationId: string, isTyping: boolean) => void
  /** Debounce delay in milliseconds (default: 1000ms) */
  debounceMs?: number
}

/**
 * Return type for the typing hook
 */
interface UseTypingReturn {
  /** Function to call when user starts typing */
  startTyping: (conversationId: string) => void
  /** Function to call when user stops typing */
  stopTyping: (conversationId: string) => void
  /** Function to call on text input changes (handles start/stop automatically) */
  onTextChange: (conversationId: string, text: string) => void
}

/**
 * Custom hook for managing typing indicators with automatic debouncing.
 * 
 * This hook provides a simple interface for sending typing indicators
 * with intelligent debouncing to prevent spam. It automatically handles
 * the start and stop typing logic based on user input.
 * 
 * Features:
 * - Automatic debouncing to prevent excessive WebSocket messages
 * - Simple integration with text inputs
 * - Per-conversation typing state management
 * - Automatic cleanup of typing timers
 * - Memory leak prevention
 * 
 * @param options Configuration object containing sendTypingStatus function
 * @returns Object containing typing management functions
 * 
 * @example
 * ```tsx
 * // Get sendTypingStatus from WebSocket hook
 * const { sendTypingStatus } = useMessagingWebSocket({ enabled: true })
 * 
 * // Create typing hook
 * const { startTyping, stopTyping, onTextChange } = useTyping({
 *   sendTypingStatus
 * })
 * 
 * // Option 1: Manual control
 * const handleInputFocus = () => startTyping(conversationId)
 * const handleInputBlur = () => stopTyping(conversationId)
 * 
 * // Option 2: Automatic with text changes (recommended)
 * const handleTextChange = (text: string) => {
 *   onTextChange(conversationId, text)
 *   setValue(text)
 * }
 * 
 * // In your TextInput component:
 * <TextInput
 *   value={value}
 *   onChangeText={handleTextChange}
 *   onFocus={() => startTyping(conversationId)}
 *   onBlur={() => stopTyping(conversationId)}
 * />
 * ```
 */
export function useTyping({ 
  sendTypingStatus, 
  debounceMs = 1000 
}: UseTypingOptions): UseTypingReturn {
  // Store timeout refs per conversation to manage debouncing
  const timeoutRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  // Track typing state per conversation to avoid duplicate sends
  const typingStates = useRef<Record<string, boolean>>({})

  /**
   * Starts typing indicator for a conversation
   */
  const startTyping = useCallback((conversationId: string) => {
    // Clear any existing stop timeout
    if (timeoutRefs.current[conversationId]) {
      clearTimeout(timeoutRefs.current[conversationId])
      delete timeoutRefs.current[conversationId]
    }

    // Only send if not already typing
    if (!typingStates.current[conversationId]) {
      sendTypingStatus(conversationId, true)
      typingStates.current[conversationId] = true
      console.log(`Started typing in conversation ${conversationId}`)
    }
  }, [sendTypingStatus])

  /**
   * Stops typing indicator for a conversation
   */
  const stopTyping = useCallback((conversationId: string) => {
    // Clear any existing timeout
    if (timeoutRefs.current[conversationId]) {
      clearTimeout(timeoutRefs.current[conversationId])
      delete timeoutRefs.current[conversationId]
    }

    // Only send if currently typing
    if (typingStates.current[conversationId]) {
      sendTypingStatus(conversationId, false)
      typingStates.current[conversationId] = false
      console.log(`Stopped typing in conversation ${conversationId}`)
    }
  }, [sendTypingStatus])

  /**
   * Handles text changes with automatic typing management
   * Call this on every text input change for automatic behavior
   */
  const onTextChange = useCallback((conversationId: string, text: string) => {
    // Clear any existing timeout
    if (timeoutRefs.current[conversationId]) {
      clearTimeout(timeoutRefs.current[conversationId])
    }

    if (text.length > 0) {
      // User is typing - start typing indicator if not already started
      if (!typingStates.current[conversationId]) {
        sendTypingStatus(conversationId, true)
        typingStates.current[conversationId] = true
        console.log(`Started typing in conversation ${conversationId}`)
      }

      // Set timeout to stop typing after debounce period
      timeoutRefs.current[conversationId] = setTimeout(() => {
        if (typingStates.current[conversationId]) {
          sendTypingStatus(conversationId, false)
          typingStates.current[conversationId] = false
          console.log(`Stopped typing in conversation ${conversationId} (debounced)`)
        }
        delete timeoutRefs.current[conversationId]
      }, debounceMs)
    } else {
      // Text is empty - stop typing immediately
      if (typingStates.current[conversationId]) {
        sendTypingStatus(conversationId, false)
        typingStates.current[conversationId] = false
        console.log(`Stopped typing in conversation ${conversationId} (empty text)`)
      }
    }
  }, [sendTypingStatus, debounceMs])

  return {
    startTyping,
    stopTyping,
    onTextChange,
  }
}