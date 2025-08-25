import {
  ConversationSummary,
  ConversationType,
  MessageType,
  useAuthStore,
} from "@bid-scents/shared-sdk";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Text, View, XStack, YStack } from "tamagui";
import { formatDate } from "../../utils/utility-functions";
import { AvatarIcon } from "../ui/avatar-icon";

interface ConversationSummaryProps {
  conversation: ConversationSummary;
}

// Helper function to format message content based on type
function formatMessageContent(messageType: MessageType, content: any): string {
  switch (messageType) {
    case MessageType.TEXT:
      return content.text || "";
    case MessageType.FILE:
      // Check file type to determine icon
      if (content.file_type?.startsWith("image/")) {
        return "🖼 Image sent";
      }
      return "📎 File sent";
    case MessageType.ACTION:
      const actionType = content.action_type;
      switch (actionType) {
        case "INITIATE_TRANSACTION":
          return "💰 Transaction initiated";
        case "CONFIRM_RECEIPT":
          return "✅ Receipt confirmed";
        case "SUBMIT_REVIEW":
          return "⭐ Review submitted";
        default:
          return "⚡ Action message";
      }
    case MessageType.SYSTEM:
      return content.text || "System message";
    default:
      return "Message";
  }
}

export function ConversationSummaryItem({
  conversation,
}: ConversationSummaryProps) {
  const { user } = useAuthStore();

  // TODO: Remove this fake user ID for testing
  const currentUserId = user?.id || "current_user";

  // Determine avatar URL and conversation name
  const getConversationDisplay = () => {
    if (conversation.type === ConversationType.DIRECT) {
      // For direct conversations, find the other participant
      const otherParticipant = conversation.participants.find(
        (p) => p.id !== currentUserId
      );
      return {
        avatarUrl: otherParticipant?.profile_image_url,
        name: conversation.name || otherParticipant?.username || "Unknown User",
        isGroup: false,
      };
    } else {
      // For group/channel conversations
      return {
        avatarUrl: conversation.thumbnail_url,
        name: conversation.name || "Group Chat",
        isGroup: true,
      };
    }
  };

  const { avatarUrl, name, isGroup } = getConversationDisplay();

  // Format last message with sender info for groups
  const formatLastMessage = () => {
    if (!conversation.last_message) {
      return "No messages yet";
    }

    const messageContent = formatMessageContent(
      conversation.last_message.content_type,
      conversation.last_message.content
    );

    // For group conversations, prefix with sender name
    if (isGroup && conversation.last_message.sender) {
      const senderName =
        conversation.last_message.sender.id === currentUserId
          ? "You"
          : conversation.last_message.sender.username;
      return `${senderName}: ${messageContent}`;
    }

    return messageContent;
  };

  const lastMessageText = formatLastMessage();
  const timestamp = conversation.last_message
    ? formatDate(conversation.last_message.created_at)
    : "";

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(screens)/(chat)/${conversation.id}`);
  };

  return (
    <XStack
      px="$4"
      py="$3"
      alignItems="center"
      gap="$3"
      backgroundColor="$background"
      hoverStyle={{ backgroundColor: "$backgroundHover" }}
      pressStyle={{ backgroundColor: "$backgroundPress" }}
      onPress={handlePress}
    >
      {/* Avatar */}
      <AvatarIcon url={avatarUrl} size="$5" isGroup={isGroup} />

      {/* Content */}
      <YStack flex={1} gap="$1.5">
        {/* Name and timestamp */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text
            fontSize="$4"
            fontWeight="600"
            color="$foreground"
            numberOfLines={1}
            flex={1}
          >
            {name}
          </Text>
          {timestamp && (
            <Text fontSize="$2" color="$mutedForeground" marginLeft="$2">
              {timestamp}
            </Text>
          )}
        </XStack>

        {/* Last message and unread badge */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text
            fontSize="$3"
            color="$mutedForeground"
            numberOfLines={1}
            flex={1}
          >
            {lastMessageText}
          </Text>

          {/* Unread badge */}
          {conversation.unread_count > 0 && (
            <View
              backgroundColor="$blue9"
              borderRadius="$10"
              minWidth={20}
              height={20}
              justifyContent="center"
              alignItems="center"
              marginLeft="$2"
            >
              <Text fontSize="$1" color="white" fontWeight="600">
                {conversation.unread_count > 99
                  ? "99+"
                  : conversation.unread_count}
              </Text>
            </View>
          )}
        </XStack>
      </YStack>
    </XStack>
  );
}
