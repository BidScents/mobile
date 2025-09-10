import { useMessages } from "@/hooks/queries/use-messages";
import { ConversationResponse, ConversationType, MessageResData, MessageType } from "@bid-scents/shared-sdk";
import { AnimatedFlashList } from "@shopify/flash-list";
import { useMessagingContext } from "providers/messaging-provider";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Text, View } from "tamagui";
import { MessageItem } from "./message-item";
import { ScrollLoadingIndicator } from "./scroll-loading-indicator";
import { ScrollToBottomButton } from "./scroll-to-bottom-button";
import { TypingIndicatorItem } from "./typing-indicator-item";

interface MessagesListProps {
  conversation: ConversationResponse;
}

export function MessagesList({ conversation }: MessagesListProps) {
  const listRef = useRef<any>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { getTypingUsers } = useMessagingContext();

  const typingUsers = getTypingUsers(conversation.id);
  
  // Get infinite query for messages - automatically seeded with conversation data
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
  } = useMessages(conversation.id);
  
  // Flatten all pages into a single array
  const allMessages = data?.pages.flat() || [];

  // Handle loading more messages (FlashList onEndReached)
  const handleEndReached = useCallback(() => {
    console.log('handleEndReached');
    // Only load if:
    // 1. There are more pages available
    // 2. Not currently fetching
    if (
      hasNextPage && 
      !isFetchingNextPage && 
      !isFetching
    ) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);

  // Memoize derived values to prevent unnecessary re-renders
  const showAvatars = useMemo(() => 
    conversation.type !== ConversationType.DIRECT, 
    [conversation.type]
  );
  
  const renderMessageItem = useCallback(({ item }: { item: MessageResData }) => {
    return (
      <MessageItem
        message={item}
        conversation={conversation}
        isGroupConversation={showAvatars}
      />
    );
  }, [conversation, showAvatars]);

  const keyExtractor = useCallback((item: MessageResData) => item.id, []);

  const getItemType = useCallback((item: MessageResData) => {
    if (item.content_type === MessageType.SYSTEM) {
      return 'system';
    }
    if (item.content_type === MessageType.ACTION) {
      return 'action';
    }
    if (item.content_type === MessageType.FILE) {
      return 'file';
    }
    return 'text';
  }, []);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent;
    const isNearBottom = contentOffset.y <= 200;
    setShowScrollButton(!isNearBottom && allMessages.length > 0);
  }, [allMessages.length]);

  const scrollToBottom = useCallback(() => {
    if (listRef.current && allMessages.length > 0) {
      listRef.current.scrollToIndex({
        index: 0,
        animated: true,
      });
    }
  }, [allMessages.length]);

  const showLoadingIndicator = useMemo(() => isFetchingNextPage, [isFetchingNextPage]);

  // Render typing indicator as list header (appears at bottom due to inverted list)
  const renderTypingIndicator = useCallback(() => {
    return (
      <TypingIndicatorItem
        typingUsers={typingUsers}
        conversationType={conversation.type}
        showAvatar={showAvatars}
      />
    );
  }, [typingUsers, conversation.type, showAvatars]);

  if (!allMessages.length) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Text fontSize="$5" fontWeight="600" color="$mutedForeground" marginBottom="$2">
          No messages yet
        </Text>
        <Text fontSize="$4" color="$mutedForeground" textAlign="center">
          Start the conversation by sending a message
        </Text>
      </View>
    );
  }

  return (
    <View flex={1}>
      <ScrollLoadingIndicator visible={showLoadingIndicator} />
      <AnimatedFlashList
        ref={listRef}
        data={allMessages}
        renderItem={renderMessageItem}
        extraData={conversation}
        estimatedItemSize={100}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        inverted={true}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
        removeClippedSubviews={true}
        drawDistance={1000}
        getItemType={getItemType}
        ListHeaderComponent={renderTypingIndicator}
      />
      <ScrollToBottomButton
        visible={showScrollButton}
        onPress={scrollToBottom}
      />
    </View>
  );
}