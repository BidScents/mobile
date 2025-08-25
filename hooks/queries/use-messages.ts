import type {
  ConversationResponse,
  MessageRequest,
  MessageResData,
  MessagesSummary,
} from "@bid-scents/shared-sdk";
import { MessageService, useAuthStore } from "@bid-scents/shared-sdk";
import {
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

// ========================================
// CONVERSATION QUERIES
// ========================================

/**
 * Get conversation summary - lists all conversations with unread counts
 * This is the main query for the messages/conversations list screen
 */
export function useConversationSummary() {
  return useQuery({
    queryKey: queryKeys.messages.summary,
    queryFn: () => MessageService.getConversationSummaryV1MessageSummaryGet(),
    staleTime: 2 * 60 * 1000, // 2 minutes - conversations change frequently with new messages
    // Conversations are critical for messaging, enable background refetch
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

/**
 * Get specific conversation with messages
 * Used for the conversation detail screen
 */
export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.messages.conversation(conversationId),
    queryFn: () =>
      MessageService.getConversationV1MessageConversationConversationIdGet(conversationId),
    staleTime: 1 * 60 * 1000, // 1 minute - conversation content changes frequently
    enabled: !!conversationId,
    // Enable background refetch for active conversations
    refetchOnWindowFocus: true,
  });
}

/**
 * Contact seller - get or create conversation with a seller
 * Used when contacting a seller from a listing
 */
export function useContactSeller(sellerId: string) {
  return useQuery({
    queryKey: queryKeys.messages.contactSeller(sellerId),
    queryFn: () =>
      MessageService.contactSellerV1MessageContactSellerSellerIdGet(sellerId),
    staleTime: 5 * 60 * 1000, // 5 minutes - seller contact info is relatively stable
    enabled: !!sellerId,
  });
}

// ========================================
// MESSAGE PAGINATION QUERIES
// ========================================

/**
 * Infinite query for loading messages with cursor pagination
 * Used for loading message history in conversation screens
 */
export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.messages.list(conversationId),
    queryFn: ({ pageParam }) => {
      return MessageService.getMessagesV1MessageConversationIdMessagesGet(
        conversationId,
        pageParam, // cursor
        20 // limit
      );
    },
    getNextPageParam: (lastPage: MessageResData[]) => {
      // If we got less than the limit, there are no more messages
      if (!lastPage || lastPage.length < 20) {
        return undefined;
      }
      
      // Use the created_at timestamp of the last message as cursor
      const lastMessage = lastPage[lastPage.length - 1];
      return lastMessage.created_at;
    },
    initialPageParam: new Date().toISOString(), // Start from current time
    staleTime: 30 * 1000, // 30 seconds - messages are real-time
    enabled: !!conversationId,
    // Enable background refetch for active message threads
    refetchOnWindowFocus: true,
  });
}

// ========================================
// CACHE HELPERS
// ========================================

/**
 * Updates conversation caches after sending a message
 * Ensures optimistic updates are reflected across all related queries
 */
function updateConversationCachesWithNewMessage(
  queryClient: QueryClient,
  conversationId: string,
  newMessage: MessageResData
) {
  // 1. Update conversation cache with new message
  queryClient.setQueryData<ConversationResponse>(
    queryKeys.messages.conversation(conversationId),
    (old) => {
      if (!old) return old;
      return {
        ...old,
        messages: [newMessage, ...old.messages],
      };
    }
  );

  // 2. Update infinite messages cache
  queryClient.setQueryData<any>(
    queryKeys.messages.list(conversationId),
    (old: any) => {
      if (!old?.pages) return old;
      
      // Add message to the first page (most recent messages)
      const updatedPages = [...old.pages];
      if (updatedPages.length > 0) {
        updatedPages[0] = [newMessage, ...updatedPages[0]];
      } else {
        updatedPages[0] = [newMessage];
      }

      return {
        ...old,
        pages: updatedPages,
      };
    }
  );

  // 3. Update conversation summary cache
  queryClient.setQueryData<MessagesSummary>(
    queryKeys.messages.summary,
    (old) => {
      if (!old) return old;
      
      return {
        ...old,
        conversations: old.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                last_message: newMessage, // Use the complete MessageResData object
                unread_count: conv.unread_count + 1, // Increment unread count for new message
              }
            : conv
        ),
      };
    }
  );
}

// ========================================
// MESSAGE MUTATIONS
// ========================================

/**
 * Send message mutation with optimistic updates
 * Updates message lists and conversation summaries optimistically
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({
      conversationId,
      messageRequest,
    }: {
      conversationId: string;
      messageRequest: MessageRequest;
    }) =>
      MessageService.sendMessageV1MessageConversationIdPost(
        conversationId,
        messageRequest
      ),
    onMutate: async ({ conversationId, messageRequest }) => {
      // Cancel outgoing queries for this conversation
      await queryClient.cancelQueries({
        queryKey: queryKeys.messages.conversation(conversationId),
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.messages.list(conversationId),
      });

      // Get current conversation data for rollback
      const previousConversationData = queryClient.getQueryData<ConversationResponse>(
        queryKeys.messages.conversation(conversationId)
      );
      const previousMessagesData = queryClient.getQueryData(
        queryKeys.messages.list(conversationId)
      );

      // Create optimistic message with current user data
      const optimisticMessage: MessageResData = {
        id: `temp-${Date.now()}`, // Temporary ID
        conversation_id: conversationId,
        content_type: messageRequest.content_type,
        content: messageRequest.content,
        sender: {
          id: user?.id || "current-user",
          username: user?.username || "You",
          profile_image_url: user?.profile_image_url || null,
        },
        created_at: new Date().toISOString(),
      };

      // Apply optimistic updates
      updateConversationCachesWithNewMessage(
        queryClient,
        conversationId,
        optimisticMessage
      );

      return {
        previousConversationData,
        previousMessagesData,
        optimisticMessage,
      };
    },
    onSuccess: (response: MessageResData, { conversationId }) => {
      // Invalidate and refetch to get the real message data from server
      // This ensures we have the correct message ID, timestamps, and any server-side updates
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversation(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.list(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.summary,
      });
    },
    onError: (err, { conversationId }, context) => {
      // Rollback optimistic updates on error
      if (context?.previousConversationData) {
        queryClient.setQueryData(
          queryKeys.messages.conversation(conversationId),
          context.previousConversationData
        );
      }
      if (context?.previousMessagesData) {
        queryClient.setQueryData(
          queryKeys.messages.list(conversationId),
          context.previousMessagesData
        );
      }
      
      // Also invalidate to ensure we have correct state
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversation(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.list(conversationId),
      });
    },
  });
}

/**
 * Update last read timestamp for a conversation
 * Used to mark conversations as read
 */
export function useUpdateLastRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      MessageService.updateLastReadV1MessageUpdateLastReadPatch(conversationId),
    onSuccess: (_, conversationId) => {
      // Update conversation summary to reflect read status
      queryClient.setQueryData<MessagesSummary>(
        queryKeys.messages.summary,
        (old) => {
          if (!old) return old;
          
          // Find the conversation to get its current unread count
          const conversation = old.conversations.find(conv => conv.id === conversationId);
          const currentUnreadCount = conversation?.unread_count || 0;
          
          return {
            ...old,
            total_unread: Math.max(0, old.total_unread - currentUnreadCount), // Decrease by actual unread count
            conversations: old.conversations.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    unread_count: 0, // Mark as fully read
                  }
                : conv
            ),
          };
        }
      );
    },
    onError: () => {
      // On error, invalidate to get fresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.summary,
      });
    },
  });
}