import { Button } from "@/components/ui/button";
import { useConfirmReceipt } from "@/hooks/queries/use-payments";
import {
  MessageResData,
  RichConfirmReceiptActionContent,
  useAuthStore
} from "@bid-scents/shared-sdk";
import { router } from "expo-router";
import { Text, XStack, YStack } from "tamagui";

interface SystemReceiptMessageProps {
  content: RichConfirmReceiptActionContent;
  isBuyer: boolean;
  messageId: string;
  message: MessageResData;
}

export function SystemReceiptMessage({ content, isBuyer, messageId, message }: SystemReceiptMessageProps) {
  const confirmReceipt = useConfirmReceipt();
  const {paymentDetails} = useAuthStore()

  const handleConfirmReceipt = async () => {
    if (!content.is_active) return;
    
    const updatedMessage: MessageResData = {
      ...message,
      content: {
        ...content,
        is_active: false
      }
    };
    
    try {
      await confirmReceipt.mutateAsync({ messageId, updatedMessage });
    } catch (error) {
      console.error("Failed to confirm receipt:", error);
    }
  };

  return (
    <YStack
      backgroundColor="$muted"
      borderRadius="$6"
      paddingBottom="$3"
      paddingTop="$4"
      paddingHorizontal="$4"
      width="100%"
      gap="$3"
      marginVertical="$5"
    >
        <Text
          fontSize="$4"
          fontWeight="500"
          color="$foreground"
          flex={1}
          minWidth="200"
        >
          {isBuyer 
            ? `You have purchased ${content.listing?.name || 'this item'}, please confirm when you receive the item`
            : content.is_active 
              ? "Once Buyer confirms receipt, funds will be transfered over"
              : `Buyer has confirmed receipt of ${content.listing?.name || 'this item'}. Funds will be transfered over`}
        </Text>

        {isBuyer && (
          <Button
            variant="primary"
            size="sm"
            onPress={handleConfirmReceipt}
            disabled={!content.is_active || confirmReceipt.isPending}
          >
            {confirmReceipt.isPending 
              ? "Processing..." 
              : content.is_active 
                ? "Confirm Receipt" 
                : "Receipt Confirmed"}
          </Button>
        )}

        <XStack
          position="absolute"
          top={-8}
          left={8}
          backgroundColor="$foreground"
          paddingHorizontal="$2"
          paddingVertical="$1"
          borderRadius="$6"
          zIndex={1}
        >
          <Text fontSize="$2" color="$background" fontWeight="600">
            {isBuyer ? "Receipt Confirmation" : content.is_active ? "Awaiting Confirmation" : "Receipt Confirmed"}
          </Text>
        </XStack>

        {!isBuyer && paymentDetails?.requires_onboarding && (
          <Button
            variant="primary"
            size="sm"
            onPress={() => router.push('/(tabs)/profile/seller-dashboard')}
            rightIcon="arrow-forward"
          >
            Onboard to get funds transfered
          </Button>
        )}

    </YStack>
  );
}