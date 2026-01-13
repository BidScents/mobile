import { useMessages } from "@/hooks/queries/use-messages";
import { ConversationResponse, ConversationType, MessageActionType, MessageResData, MessageType, RichConfirmReceiptActionContent, useAuthStore } from "@bid-scents/shared-sdk";
import { AnimatedFlashList } from "@shopify/flash-list";
import { useMessagingContext } from "providers/messaging-provider";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator } from "react-native";
import { Text, View, YStack } from "tamagui";
import { EmptyChatOnboarding } from "./empty-chat-onboarding";
import { SystemReceiptMessage } from "./message-content/system-receipt-message";
import { MessageItem } from "./message-item";
import { ScrollLoadingIndicator } from "./scroll-loading-indicator";
import { ScrollToBottomButton } from "./scroll-to-bottom-button";
import { TypingIndicatorItem } from "./typing-indicator-item";

interface MessagesListProps {
  conversation: ConversationResponse;
  onSellThisPress?: (listing: any) => void;
}

export function MessagesList({ conversation, onSellThisPress }: MessagesListProps) {
  const listRef = useRef<any>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { getTypingUsers } = useMessagingContext();
  const { user } = useAuthStore();

  const typingUsers = getTypingUsers(conversation.id);
  
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
    isLoading
  } = useMessages(conversation.id);
  
  // Flatten all pages into a single array
  const allMessages = data?.pages.flat() || [];

  const activeStickyMessage = useMemo(() => {
    return allMessages.find((message) => {
      if (!message.content || !('is_active' in message.content) || !(message.content as any).is_active) return false;

      const isSystemSender = message.sender?.id === "00000000-0000-0000-0000-000000000000";
      
      if (isSystemSender) {
        const content = message.content as RichConfirmReceiptActionContent;
        return content.action_type === MessageActionType.CONFIRM_RECEIPT;
      }

      return false;
    });
  }, [allMessages]);

  const renderStickyMessage = useCallback(() => {
    if (!activeStickyMessage) return null;

    const isSystemSender = activeStickyMessage.sender?.id === "00000000-0000-0000-0000-000000000000";
    
    if (isSystemSender) {
      const isBuyerSystem = (activeStickyMessage.content as RichConfirmReceiptActionContent).buyer_id === user?.id;
      return (
        <SystemReceiptMessage
          content={activeStickyMessage.content as RichConfirmReceiptActionContent}
          isBuyer={isBuyerSystem}
          messageId={activeStickyMessage.id}
          message={activeStickyMessage}
          isSticky={true}
        />
      );
    }
    
    return null;
  }, [activeStickyMessage, user?.id]);

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
        onSellThisPress={onSellThisPress}
      />
    );
  }, [conversation, showAvatars, onSellThisPress]);

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

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" />
        <Text fontSize="$4" color="$color11" marginTop="$3">
          Loading conversation...
        </Text>
      </YStack>
    )
  }

  if (!allMessages.length) {
    return <EmptyChatOnboarding />;
  }

  return (
    <View flex={1}>
      {renderStickyMessage()}
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