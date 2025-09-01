import { ChatInputBar } from "@/components/messeges/chat-input-bar";
import { MessagesList } from "@/components/messeges/messages-list";
import { Container } from "@/components/ui/container";
import { KeyboardAwareView } from "@/components/ui/keyboard-aware-view";
import { useConversation, useConversationSummary, useUpdateLastRead } from "@/hooks/queries/use-messages";
import { ConversationSummary } from "@bid-scents/shared-sdk";
import { useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { Text, YStack } from "tamagui";


export default function SpecificChatScreen() {
  const { id } = useLocalSearchParams();
  const updateLastRead = useUpdateLastRead();
  const navigation = useNavigation();
  const { data: conversationSummary } = useConversationSummary();
  const { data: conversation, isLoading, error, refetch } = useConversation(id as string);

  // Update header title when conversation data is available
  useEffect(() => {
    if (conversationSummary) {
      const conversationTitle = conversationSummary.conversations.find(
        (conv: ConversationSummary) => conv.id === id
      )?.participants[0].username;
      navigation.setOptions({ title: conversationTitle });
    }
  }, [conversationSummary, id, navigation]);

  // Update last read status when the screen is focused
  useFocusEffect(
    useCallback(() => {
      const update = () => {
        if (id) {
          updateLastRead.mutate(id as string);
        }
      };

      update(); // Initial update on focus
      const intervalId = setInterval(update, 15000);

      return () => clearInterval(intervalId); // Cleanup on blur
    }, [id])
  );

  // Loading state
  if (isLoading) {
    return (
      <Container
        variant="fullscreen"
        safeArea={["top"]}
        backgroundColor="$background"
      >
        <YStack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" />
          <Text fontSize="$4" color="$color11" marginTop="$3">
            Loading conversation...
          </Text>
        </YStack>
      </Container>
    );
  }

  // Error state
  if (error || !conversation) {
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
            Unable to load this conversation. Please try again.
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

  return (
    <Container
      variant="fullscreen"
      safeArea={false}
      backgroundColor="$background"
    >
      <KeyboardAwareView>
        <MessagesList conversation={conversation} />
        <ChatInputBar id={id as string} />
      </KeyboardAwareView>
    </Container>
  );
}
