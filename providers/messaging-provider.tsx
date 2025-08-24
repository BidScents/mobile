import { TypingResData, useAuthStore } from "@bid-scents/shared-sdk";
import { useQueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import { queryKeys } from "../hooks/queries/query-keys";
import { useMessagingWebSocket } from "../hooks/use-messaging-websocket";
import { useMessagingWebSocketHandlers } from "../hooks/use-messaging-websocket-handlers";
import { useTyping } from "../hooks/use-typing";

/**
 * Context value for messaging functionality
 */
interface MessagingContextValue {
  /** Whether the WebSocket is currently connected */
  isConnected: boolean;
  /** Current app state */
  appState: AppStateStatus;
  /** Typing management functions */
  typing: {
    startTyping: (conversationId: string) => void;
    stopTyping: (conversationId: string) => void;
    onTextChange: (conversationId: string, text: string) => void;
  };
  /** Get typing users for a conversation */
  getTypingUsers: (conversationId: string) => TypingResData[];
  /** Force UI update (useful for typing indicators) */
  forceUpdate: () => void;
}

/**
 * Messaging context for global access to real-time messaging functionality
 */
const MessagingContext = createContext<MessagingContextValue | null>(null);

/**
 * Hook to access messaging context
 * @throws Error if used outside MessagingProvider
 */
export function useMessagingContext(): MessagingContextValue {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error(
      "useMessagingContext must be used within MessagingProvider"
    );
  }
  return context;
}

/**
 * Props for the MessagingProvider component
 */
interface MessagingProviderProps {
  children: React.ReactNode;
}

/**
 * Messaging Provider Component
 *
 * Provides global real-time messaging functionality with intelligent background/foreground handling.
 *
 * Features:
 * - Automatic WebSocket connection management based on auth state
 * - Background/foreground connection optimization
 * - Global typing indicator management
 * - Cache invalidation on foreground return
 * - Battery and data usage optimization
 *
 * Background Strategy:
 * - Disconnects WebSocket when app goes to background/inactive
 * - Relies on push notifications for message delivery when backgrounded
 * - Saves battery and data usage
 *
 * Foreground Strategy:
 * - Reconnects WebSocket when app becomes active
 * - Invalidates message-related caches to sync with any missed updates
 * - Resumes real-time typing indicators and message updates
 *
 * Usage:
 * ```tsx
 * // Add to your app root (after QueryProvider)
 * <QueryProvider>
 *   <MessagingProvider>
 *     <YourAppContent />
 *   </MessagingProvider>
 * </QueryProvider>
 *
 * // Use in any component
 * const { isConnected, typing, getTypingUsers } = useMessagingContext()
 * ```
 */
export function MessagingProvider({ children }: MessagingProviderProps) {
  const { user, isAuthenticated, isOnboarded } = useAuthStore();
  const queryClient = useQueryClient();
  const [, forceUpdate] = useState({});
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );

  // Store typing users per conversation
  const typingUsersRef = useRef<Record<string, TypingResData[]>>({});

  // Track if we should be connected (auth + foreground)
  const shouldBeConnected =
    isAuthenticated && isOnboarded && appState === "active";

  // Force update function for typing indicators
  const triggerUpdate = () => forceUpdate({});

  // Create WebSocket handlers
  const handlers = useMessagingWebSocketHandlers({
    currentUserId: user?.id,
    onUIUpdate: triggerUpdate,
    typingUsersRef,
  });

  // Create WebSocket connection with handlers
  const { isConnected, sendTypingStatus } = useMessagingWebSocket({
    enabled: shouldBeConnected, // Only connect when authenticated, onboarded, and app is active
    onConnect: handlers.handleConnect,
    onDisconnect: handlers.handleDisconnect,
    onMessage: handlers.handleMessage,
    onTyping: handlers.handleTyping,
    onUpdateLastRead: handlers.handleUpdateLastRead,
    onError: handlers.handleError,
  });

  // Create typing management
  const typing = useTyping({
    sendTypingStatus,
    debounceMs: 1000,
  });

  /**
   * Handle app state changes for WebSocket lifecycle management
   */
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      console.log("App state changed:", appState, "->", nextAppState);
      setAppState(nextAppState);

      // When app comes back to foreground, invalidate message caches to sync any missed updates
      if (appState !== "active" && nextAppState === "active") {
        console.log("App returned to foreground - refreshing message data");

        // Invalidate message-related queries to sync with any updates that happened while backgrounded
        queryClient.invalidateQueries({
          queryKey: queryKeys.messages.summary,
        });

        // Clear all typing indicators since they would be stale
        if (typingUsersRef.current) {
          typingUsersRef.current = {};
          triggerUpdate();
        }
      }

      // When app goes to background, clear typing indicators
      if (nextAppState === "background" || nextAppState === "inactive") {
        console.log("App went to background - clearing typing indicators");

        // Stop any active typing indicators
        Object.keys(typingUsersRef.current || {}).forEach((conversationId) => {
          typing.stopTyping(conversationId);
        });

        // Clear typing state
        if (typingUsersRef.current) {
          typingUsersRef.current = {};
          triggerUpdate();
        }
      }
    });

    return () => subscription.remove();
  }, [appState, queryClient, typing]);

  /**
   * Log connection state changes for debugging
   */
  useEffect(() => {
    console.log("WebSocket connection state:", {
      isConnected,
      shouldBeConnected,
      isAuthenticated,
      isOnboarded,
      appState,
    });
  }, [isConnected, shouldBeConnected, isAuthenticated, isOnboarded, appState]);

  /**
   * Get typing users for a specific conversation
   */
  const getTypingUsers = (conversationId: string): TypingResData[] => {
    return typingUsersRef.current[conversationId] || [];
  };

  // Create context value
  const contextValue: MessagingContextValue = {
    isConnected,
    appState,
    typing,
    getTypingUsers,
    forceUpdate: triggerUpdate,
  };

  return (
    <MessagingContext.Provider value={contextValue}>
      {children}
    </MessagingContext.Provider>
  );
}
