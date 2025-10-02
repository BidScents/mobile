import { ThemedIonicons } from "@/components/ui/themed-icons";
import { formatDate } from "@/utils/utility-functions";
import {
  ConversationResponse,
  FileContent,
  MessageActionType,
  MessageResData,
  MessageType,
  RichConfirmReceiptActionContent,
  RichInitiateTransactionActionContent,
  RichSubmitReviewActionContent,
  RichTextContent,
  useAuthStore,
} from "@bid-scents/shared-sdk";
import React, { useCallback, useMemo } from "react";
import { Avatar, Text, View, XStack, YStack } from "tamagui";
import { ActionMessage } from "./message-content/action-message";
import { FileMessage } from "./message-content/file-message";
import { SystemReceiptMessage } from "./message-content/system-receipt-message";
import { SystemReviewMessage } from "./message-content/system-review-message";
import { TextMessage } from "./message-content/text-message";

interface MessageItemProps {
  message: MessageResData;
  conversation: ConversationResponse;
  showTimestamp?: boolean;
  isGroupConversation?: boolean;
}

const MessageItemComponent = ({
  message,
  conversation,
  showTimestamp = true,
  isGroupConversation = false,
}: MessageItemProps) => {
  const { user } = useAuthStore();
  
  // Memoize expensive calculations
  const isCurrentUser = useMemo(() => 
    message.sender?.id === user?.id, 
    [message.sender?.id, user?.id]
  );

  const isSystemMessage = useMemo(() => 
    message.sender?.id === "00000000-0000-0000-0000-000000000000", 
    [message.sender?.id]
  );
  
  // Memoize read status calculation
  const isRead = useMemo(() => {
    // A message is read if every participant (except the sender) has read it.
    const otherParticipants = conversation.participants.filter(
      (p) => p.user.id !== message.sender?.id
    );

    // If there are no other participants, the message is not considered 'read' by others.
    if (otherParticipants.length === 0) {
      return false;
    }

    // Check if all other participants have a last_read_at timestamp that is
    // greater than or equal to the message's creation time.
    return otherParticipants.every((p) => {
      return p.last_read_at && new Date(p.last_read_at) >= new Date(message.created_at);
    });
  }, [conversation.participants, message.created_at, message.sender?.id]);

  // Memoize message type and alignment calculation
  const { actualType, align } = useMemo(() => {
    // Check if it's a system message first (simplest approach)
    if (isSystemMessage) {
      return { actualType: 'SYSTEM', align: 'center' };
    }
    
    if (message.content_type === MessageType.ACTION) {
      const content = message.content as any;
      
      // Only transactions with unit_price and quantity are true ACTION messages
      const isTransaction = content && 'unit_price' in content && 'quantity' in content;
      
      if (isTransaction) {
        return { actualType: 'ACTION', align: isCurrentUser ? 'right' : 'left' };
      } else {
        // This shouldn't happen now that we check isSystemMessage first, but keep as fallback
        return { actualType: 'SYSTEM', align: 'center' };
      }
    }
    
    return { actualType: message.content_type, align: isCurrentUser ? 'right' : 'left' };
  }, [message.content_type, message.content, isCurrentUser, user?.id, isSystemMessage]);

  const renderMessageContent = useCallback(() => {
    
    switch (actualType) {
      case MessageType.TEXT:
        return (
          <TextMessage
            content={message.content as RichTextContent}
            isCurrentUser={isCurrentUser}
          />
        );
      case MessageType.FILE:
        return (
          <FileMessage
            content={message.content as FileContent}
            isCurrentUser={isCurrentUser}
            messageId={message.id}
          />
        );
      case 'ACTION':
        const isBuyerAction = (message.content as RichInitiateTransactionActionContent).buyer_id === user?.id;
        return (
          <ActionMessage
            content={message.content as RichInitiateTransactionActionContent}
            isCurrentUser={isCurrentUser}
            messageId={message.id}
            isBuyer={isBuyerAction}
            message={message}
          />
        );
      case 'SYSTEM':
        const isBuyerSystem = (message.content as RichConfirmReceiptActionContent | RichSubmitReviewActionContent).buyer_id === user?.id;
        const isConfirmReceipt = (message.content as RichConfirmReceiptActionContent).action_type === MessageActionType.CONFIRM_RECEIPT;

        if (isConfirmReceipt) {
          return (
            <SystemReceiptMessage
              content={message.content as RichConfirmReceiptActionContent}
              isBuyer={isBuyerSystem}
              messageId={message.id}
              message={message}
            />
          );
        }else{
          return (
            <SystemReviewMessage
              content={message.content as RichSubmitReviewActionContent}
              isBuyer={isBuyerSystem}
              messageId={message.id}
              message={message}
            />
          );
        }
      default:
        return (
          <Text
            fontSize="$4"
            color={isCurrentUser ? "$white" : "$foreground"}
          >
            Unsupported message type
          </Text>
        );
    }
  }, [actualType, align, message.content, message.id, user?.id]);

  // Handle different alignments
  if (align === 'center') {
    return (
      renderMessageContent()
    );
  }

  return (
    <View marginVertical="$0.5">
      <XStack
        justifyContent={align === 'right' ? "flex-end" : "flex-start"}
      >
        {/* Show avatar only in group conversations and only for non-current users */}
        {isGroupConversation && align === 'left' && (
          <Avatar circular size="$2" marginRight="$2">
            <Avatar.Image
              source={{
                uri: message.sender?.profile_image_url || undefined,
              }}
            />
            <Avatar.Fallback backgroundColor="$muted">
              <Text fontSize="$2" fontWeight="600" color="$mutedForeground">
                {message.sender?.username?.charAt(0).toUpperCase() || "?"}
              </Text>
            </Avatar.Fallback>
          </Avatar>
        )}

        {/* Message bubble */}
        <YStack
          maxWidth="80%"
          alignItems={align === 'right' ? "flex-end" : "flex-start"}
        >
          <View
            backgroundColor={align === 'right' ? "$muted" : "$muted"}
            borderRadius="$5"
            padding="$2"
            borderBottomLeftRadius={align === 'left' ? "$1" : "$5"}
            borderBottomRightRadius={align === 'right' ? "$1" : "$5"}
          >
            {renderMessageContent()}
          </View>

          {/* Timestamp and read status in same line */}
          {showTimestamp && (
            <XStack
              alignItems="center"
              gap="$1.5"
              marginTop="$1"
              justifyContent={align === 'right' ? "flex-end" : "flex-start"}
            >
              <Text fontSize="$1" color="$mutedForeground">
                {formatDate(message.created_at)}
              </Text>
              
              {/* Read status for current user messages */}
              {isCurrentUser && (
                <View>
                  {isRead ? (
                    <ThemedIonicons name="checkmark-done-outline" size={16} color="$mutedForeground" />
                  ) : (
                    <ThemedIonicons name="checkmark-outline" size={16} color="$mutedForeground" />
                  )}
                </View>
              )}
            </XStack>
          )}
        </YStack>
      </XStack>
    </View>
  );
};

const areEqual = (
  prevProps: MessageItemProps,
  nextProps: MessageItemProps
) => {
  // If message ID is different, it's a different message.
  if (prevProps.message.id !== nextProps.message.id) {
    return false;
  }

  // Check if message content has changed (important for transaction status updates)
  if (JSON.stringify(prevProps.message.content) !== JSON.stringify(nextProps.message.content)) {
    return false;
  }

  // Check if message created_at has changed (rare but possible)
  if (prevProps.message.created_at !== nextProps.message.created_at) {
    return false;
  }

  // The crucial check: compare the last_read_at of all participants.
  // If any participant's read time has changed, we need to re-render.
  for (let i = 0; i < prevProps.conversation.participants.length; i++) {
    if (
      prevProps.conversation.participants[i].last_read_at !==
      nextProps.conversation.participants[i].last_read_at
    ) {
      return false;
    }
  }

  // If nothing has changed, don't re-render.
  return true;
};

export const MessageItem = React.memo(MessageItemComponent, areEqual);