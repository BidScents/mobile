import { useSendMessage } from "@/hooks/queries/use-messages";
import { MessageType } from "@bid-scents/shared-sdk";
import { useMessagingContext } from "providers/messaging-provider";
import { useState } from "react";
import { Input, XStack } from "tamagui";
import { ThemedIonicons } from "../ui/themed-icons";

interface ChatInputBarProps {
  id: string;
}

export const ChatInputBar = ({ id }: ChatInputBarProps) => {
  const [messageText, setMessageText] = useState("");
  const sendMessageMutation = useSendMessage();
  const { typing } = useMessagingContext();

  const handleTextChange = (text: string) => {
    typing.onTextChange(id, text);
    setMessageText(text);
  };

  const sendTextMessage = () => {
    if (!messageText.trim()) return;

    console.log("text message sending");
    sendMessageMutation.mutate({
      conversationId: id,
      messageRequest: {
        content_type: MessageType.TEXT,
        content: { text: messageText.trim() }
      },
    });
    setMessageText("");
  };
  return (
    <XStack alignItems="center" gap="$3" pb="$3" pt="$2" px="$3">
      <XStack bg="$muted" borderRadius="$6" alignItems="center" gap="$2" flex={1} pr="$3">
      <Input
        placeholder="Type your message"
        value={messageText}
        onFocus={() => typing.startTyping(id)}
        onBlur={() => typing.stopTyping(id)}
        onChangeText={(text) => handleTextChange(text)}
        onSubmitEditing={sendTextMessage}
        flex={1}
        borderRadius="$6"
        height="$4"
        fontSize="$5"
        borderWidth={0}
        backgroundColor="$muted"
        color="$foreground"
        px="$3"
      />
      <ThemedIonicons name="add-outline" size={24} color="$mutedForeground" />
      </XStack>
      <ThemedIonicons name="send" size={24} onPress={sendTextMessage} />
    </XStack>
  );
};
