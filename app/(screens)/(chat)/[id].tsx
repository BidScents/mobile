import { ChatInputBar } from "@/components/messeges/chat-input-bar";
import { MessagesList } from "@/components/messeges/messages-list";
import { TransactionBottomSheet, TransactionBottomSheetMethods } from "@/components/forms/transaction-bottom-sheet";
import { Container } from "@/components/ui/container";
import { KeyboardAwareView } from "@/components/ui/keyboard-aware-view";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { useConversation, useConversationSummary, useUpdateLastRead } from "@/hooks/queries/use-messages";
import { ConversationSummary, UserPreview, useAuthStore } from "@bid-scents/shared-sdk";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { ActivityIndicator } from "react-native";
import { Text, XStack, YStack } from "tamagui";


export default function SpecificChatScreen() {
  const { id, listingId } = useLocalSearchParams();
  const updateLastRead = useUpdateLastRead();
  const navigation = useNavigation();
  const { data: conversationSummary } = useConversationSummary();
  const { data: conversation, isLoading, error, refetch } = useConversation(id as string);
  const { user } = useAuthStore();
  const transactionBottomSheetRef = useRef<TransactionBottomSheetMethods>(null);

  const handleSellThisPress = useCallback((listing: any) => {
    transactionBottomSheetRef.current?.presentWithListing(listing);
  }, []);

  // Get the other participant for the transaction
  const otherParticipantId = conversation?.participants.find(
    (participant) => participant.user.id !== user?.id
  )?.user.id;

  // Update header title when conversation data is available
  useEffect(() => {
    if (conversationSummary && user?.id) {
      const currentConversation = conversationSummary.conversations.find(
        (conv: ConversationSummary) => conv.id === id
      );
      
      if (currentConversation) {
        const otherParticipant = currentConversation.participants.find(
          (participant: UserPreview) => participant.id !== user.id
        );
        
        navigation.setOptions({ title: otherParticipant?.username || "Chat", headerRight: () => (
          <XStack 
            alignItems="center" 
            hitSlop={20} 
            backgroundColor="$muted" 
            paddingHorizontal="$2" 
            paddingVertical="$1.5" 
            borderRadius="$5" 
            gap="$2" 
            onPress={() => router.push(`/profile/${otherParticipant?.id}`)}
          >
            <Text fontSize="$3" fontWeight="500" color="$foreground">
             View Store
            </Text>
            <ThemedIonicons
              name="navigate-circle"
              size={18}
              color="$mutedForeground"
            />
        </XStack>
        )});
      }
    }
  }, [conversationSummary, id, navigation, user?.id]);

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
        {isLoading ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator size="large" />
            <Text fontSize="$4" color="$color11" marginTop="$3">
              Loading conversation...
            </Text>
          </YStack>
        ) : (
            <MessagesList conversation={conversation!} onSellThisPress={handleSellThisPress} />
        )}
        <ChatInputBar id={id as string} referenceListingId={listingId as string} />
      </KeyboardAwareView>
      
      {/* Transaction Bottom Sheet */}
      {otherParticipantId && (
        <TransactionBottomSheet
          ref={transactionBottomSheetRef}
          conversationId={id as string}
          buyerId={otherParticipantId}
        />
      )}
    </Container>
  );
}
