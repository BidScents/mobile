import { useConversation } from "@/hooks/queries/use-messages";
import { ConversationType, useAuthStore } from "@bid-scents/shared-sdk";
import * as Haptics from 'expo-haptics';
import { useMemo, useRef } from "react";
import { Keyboard } from "react-native";
import { type TransactionBottomSheetMethods } from "@/components/forms/transaction-bottom-sheet";

interface UseTransactionActionsProps {
  conversationId: string;
}

export const useTransactionActions = ({ conversationId }: UseTransactionActionsProps) => {
  const { user } = useAuthStore();
  const { data: conversation } = useConversation(conversationId);
  const transactionBottomSheetRef = useRef<TransactionBottomSheetMethods>(null);

  // Determine if current user can initiate transactions in this conversation
  const showTransactionButton = useMemo(() => {
    if (!conversation || !user) return false;
    
    // Don't show transaction button for group chats
    if (conversation.type === ConversationType.GROUP) return false;
    
    // Show for direct conversations - any participant can initiate transactions
    return conversation.type === ConversationType.DIRECT;
  }, [conversation, user]);

  // Get the buyer ID (the other participant in the conversation)
  const buyerId = useMemo(() => {
    if (!conversation || !user) return "";
    
    const otherParticipant = conversation.participants.find(
      (participant) => participant.user.id !== user.id
    );
    
    return otherParticipant?.user.id || "";
  }, [conversation, user]);

  const openTransactionBottomSheet = () => {
    Keyboard.dismiss();
    transactionBottomSheetRef.current?.present();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTransactionCreated = () => {
    console.log("Transaction created successfully");
  };

  return {
    showTransactionButton,
    buyerId,
    transactionBottomSheetRef,
    openTransactionBottomSheet,
    handleTransactionCreated,
  };
};