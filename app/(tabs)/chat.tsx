import { ConversationSummaryItem } from "@/components/messeges/conversation-summary-item";
import { Container } from "@/components/ui/container";
import { useConversationSummary } from "@/hooks/queries/use-messages";
import { ConversationSummary, MessageService } from "@bid-scents/shared-sdk";
import { LegendList } from "@legendapp/list";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo } from "react";
import { Text, View, YStack } from "tamagui";
import { queryKeys } from "@/hooks/queries/query-keys";

const MemoizedConversationSummaryItem = React.memo(ConversationSummaryItem);

export default function ChatScreen() {
  const { data, isLoading, refetch, error } = useConversationSummary();
  const tabbarHeight = useBottomTabBarHeight();
  const queryClient = useQueryClient();

  const conversations = useMemo(() => data?.conversations || [], [data?.conversations]);

  // Prefetch the first 3 conversations for better UX
  useEffect(() => {
    if (conversations.length > 0) {
      const conversationsToPrefetch = conversations.slice(0, 3);
      
      conversationsToPrefetch.forEach((conversation) => {
        queryClient.prefetchQuery({
          queryKey: queryKeys.messages.conversation(conversation.id),
          queryFn: () => MessageService.getConversationV1MessageConversationConversationIdGet(conversation.id),
          staleTime: 2 * 60 * 1000, // 2 minutes - same as useConversation hook
        }).catch((error) => {
          // Silently handle prefetch errors to avoid affecting main UI
          console.warn(`Failed to prefetch conversation ${conversation.id}:`, error);
        });
      });
    }
  }, [conversations, queryClient]);

  // Render conversation item
  const renderConversationItem = useCallback(
    ({ item }: { item: ConversationSummary }) => {
      return <MemoizedConversationSummaryItem conversation={item} />;
    },
    []
  );

  // Key extractor
  const keyExtractor = useCallback((item: ConversationSummary) => item.id, []);

  // Loading skeleton
  const renderSkeletonItem = useCallback(({ index }: { index: number }) => {
    return (
      <View
        key={`skeleton-${index}`}
        padding="$4"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <View
          height={60}
          backgroundColor="$backgroundPress"
          borderRadius="$2"
          opacity={0.5}
        />
      </View>
    );
  }, []);

  // Loading state
  if (isLoading) {
    const skeletonData = Array.from({ length: 8 }, (_, index) => ({
      id: index,
    }));

    return (
      <Container
        variant="fullscreen"
        safeArea={[]}
        backgroundColor="$background"
      >
        <LegendList
          data={skeletonData}
          renderItem={renderSkeletonItem}
          estimatedItemSize={80}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item: any) => `skeleton-${item.id}`}
          contentContainerStyle={{ paddingBottom: tabbarHeight }}
        />
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container
        variant="padded"
        safeArea={["top"]}
        backgroundColor="$background"
      >
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
          <Text fontSize="$6" fontWeight="600" color="$color">
            Something went wrong
          </Text>
          <Text fontSize="$4" color="$color11" textAlign="center">
            Unable to load your conversations. Please try again.
          </Text>
          <Text
            fontSize="$4"
            color="$blue9"
            textDecorationLine="underline"
            onPress={() => refetch()}
          >
            Retry
          </Text>
        </YStack>
      </Container>
    );
  }

  // Empty state
  if (!conversations || conversations.length === 0) {
    return (
      <Container
        variant="padded"
        safeArea={false}
        backgroundColor="$background"
      >
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4">
          <Text fontSize="$6" fontWeight="600" color="$color">
            No Conversations
          </Text>
          <Text fontSize="$4" color="$color11" textAlign="center">
            Start chatting by contacting a seller from a listing.
          </Text>
        </YStack>
      </Container>
    );
  }

  // Conversations list
  return (
    <Container
      variant="fullscreen"
      safeArea={false}
      backgroundColor="$background"
    >
      <LegendList
        data={conversations}
        renderItem={renderConversationItem}
        estimatedItemSize={80}
        showsVerticalScrollIndicator={false}
        keyExtractor={keyExtractor}
        onRefresh={refetch}
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: tabbarHeight }}
      />
    </Container>
  );
}
