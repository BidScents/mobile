import { ChatInputBar } from "@/components/messeges/chat-input-bar";
import { Container } from "@/components/ui/container";
import { KeyboardAwareView } from "@/components/ui/keyboard-aware-view";
import {
  useConversation,
  useUpdateLastRead,
} from "@/hooks/queries/use-messages";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useMessagingContext } from "providers/messaging-provider";
import { useCallback, useState } from "react";
import { ScrollView, Text } from "tamagui";


export default function SpecificChatScreen() {
  const { id } = useLocalSearchParams();
  const updateLastRead = useUpdateLastRead();
  const [messageText, setMessageText] = useState("");
  const { isConnected, typing, getTypingUsers } = useMessagingContext();
  const {
    data: conversation,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useConversation(id as string);

  // Update when screen gains focus
  useFocusEffect(
    useCallback(() => {
      updateLastRead.mutate(id as string);
      console.log("Updated last read on focus for conversation", id);
    }, [id])
  );


  return (
    <Container
      variant="padded"
      safeArea={["top"]}
      backgroundColor="$background"
    >
      <KeyboardAwareView>
        <ScrollView keyboardDismissMode="on-drag">
          <Text>KeyboardAwareView</Text>
        </ScrollView>

        <ChatInputBar id={id as string} />
      </KeyboardAwareView>
    </Container>
  );
}
