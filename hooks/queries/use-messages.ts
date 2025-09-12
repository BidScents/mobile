import type {
  ConversationResponse,
  MessageRequest,
  MessageResData,
  MessagesSummary,
} from "@bid-scents/shared-sdk";
import { MessageService, MessageType, useAuthStore } from "@bid-scents/shared-sdk";
import {
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
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
      MessageService.getConversationV1MessageConversationConversationIdGet(
        conversationId
      ),
    staleTime: 1 * 60 * 1000, // 1 minute - conversation content changes frequently
    enabled: !!conversationId,
    // Enable background refetch for active conversations
    refetchOnWindowFocus: true,
  });
}

// ========================================
// MESSAGE PAGINATION QUERIES
// ========================================

/**
 * Infinite query for loading messages with cursor pagination
 * Automatically seeds with conversation data when available
 */
export function useMessages(conversationId: string) {
  const queryClient = useQueryClient()
  
  return useInfiniteQuery({
    queryKey: queryKeys.messages.list(conversationId),
    queryFn: ({ pageParam }) => {
      // Only fetch if we have a cursor (meaning we need older messages)
      if (!pageParam) return [];
      
      return MessageService.getMessagesV1MessageConversationIdMessagesGet(
        conversationId,
        pageParam, // cursor timestamp
        50 // limit
      );
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: MessageResData[]) => {
      // No more pages if we got less than the limit
      if (!lastPage || lastPage.length < 50) {
        return undefined;
      }
      
      // Use the oldest message's timestamp as cursor for next page
      const oldestMessage = lastPage[lastPage.length - 1];
      return oldestMessage.created_at;
    },
    // Seed with conversation messages if available
    initialData: () => {
      const conversation = queryClient.getQueryData<ConversationResponse>(
        queryKeys.messages.conversation(conversationId)
      )
      if (conversation?.messages?.length) {
        return {
          pages: [conversation.messages],
          pageParams: [undefined],
        }
      }
      return undefined
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!conversationId,
    refetchOnMount: false,
  });
}


// ========================================
// CACHE HELPERS
// ========================================

/**
 * Universal function to update all message-related caches
 * Updates both conversation and infinite message caches for real-time consistency
 */
export function updateAllMessageCaches(
  queryClient: QueryClient,
  conversationId: string,
  newMessage: MessageResData
) {
  // 1. Update conversation cache - add to messages array
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

  // 2. Update infinite messages cache for immediate UI visibility
  queryClient.setQueryData(
    queryKeys.messages.list(conversationId),
    (old: any) => {
      if (!old?.pages) return old;
      
      // Add to the first page (most recent messages)
      const firstPage = old.pages[0] || [];
      const updatedFirstPage = [newMessage, ...firstPage];
      
      return {
        ...old,
        pages: [updatedFirstPage, ...old.pages.slice(1)],
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
                last_message: newMessage,
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
 * Contact seller mutation - creates or gets existing conversation with a seller
 * Used when contacting a seller from a listing
 * Automatically caches the result using the conversation query key
 */
export function useContactSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sellerId: string) =>
      MessageService.contactSellerV1MessageContactSellerSellerIdGet(sellerId),
    onSuccess: (conversationResponse: ConversationResponse) => {
      // Store the conversation data in the conversation cache
      queryClient.setQueryData(
        queryKeys.messages.conversation(conversationResponse.id),
        conversationResponse
      );

      // Also invalidate the conversation summary cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.summary,
      });
    },
  });
}

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
      // Skip optimistic updates for image messages - wait for success
      if (messageRequest.content_type === MessageType.FILE) {
        return {
          previousConversationData: null,
          previousMessagesData: null,
          optimisticMessage: null,
        };
      }

      // Cancel outgoing queries for this conversation (text messages only)
      await queryClient.cancelQueries({
        queryKey: queryKeys.messages.conversation(conversationId),
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.messages.list(conversationId),
      });

      // Get current conversation data for rollback
      const previousConversationData =
        queryClient.getQueryData<ConversationResponse>(
          queryKeys.messages.conversation(conversationId)
        );
      const previousMessagesData = queryClient.getQueryData(
        queryKeys.messages.list(conversationId)
      );

      // Create optimistic message with current user data (text messages only)
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

      // Apply optimistic updates (text messages only)
      updateAllMessageCaches(
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
    onSuccess: (response: MessageResData, { conversationId, messageRequest }) => {
      console.log("Message sent successfully:", response);
      
      // For text messages: replace optimistic message with real message
      if (messageRequest.content_type === MessageType.TEXT) {
        queryClient.setQueryData<ConversationResponse>(
          queryKeys.messages.conversation(conversationId),
          (old) => {
            if (!old) return old;
            return {
              ...old,
              messages: old.messages.map(msg => 
                msg.id.startsWith('temp-')
                  ? response // Replace optimistic with real message
                  : msg
              ),
            };
          }
        );
      } else {
        // For image messages: add the new message to cache (no optimistic update to replace)
        updateAllMessageCaches(
          queryClient,
          conversationId,
          response
        );
      }
    },
    onError: (err, { conversationId, messageRequest }, context) => {
      console.error("Message send failed:", err);
      
      // Only rollback if we had optimistic updates (text messages)
      if (messageRequest.content_type === MessageType.TEXT && context?.previousConversationData) {
        queryClient.setQueryData(
          queryKeys.messages.conversation(conversationId),
          context.previousConversationData
        );
      }
      if (messageRequest.content_type === MessageType.TEXT && context?.previousMessagesData) {
        queryClient.setQueryData(
          queryKeys.messages.list(conversationId),
          context.previousMessagesData
        );
      }

      // Always invalidate to ensure we have correct state
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
          const conversation = old.conversations.find(
            (conv) => conv.id === conversationId
          );
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
