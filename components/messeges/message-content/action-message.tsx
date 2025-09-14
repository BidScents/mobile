import { StripePaymentSheet } from "@/components/payments/stripe-payment-sheet";
import { Button } from "@/components/ui/button";
import { currency } from "@/constants/constants";
import { useAcceptTransaction, useCancelTransaction } from "@/hooks/queries/use-payments";
import { MessageResData, PaymentResponse, RichInitiateTransactionActionContent } from "@bid-scents/shared-sdk";
import FastImage from "@d11/react-native-fast-image";
import { useState } from "react";
import { Text, View } from "tamagui";

interface ActionMessageProps {
  content: RichInitiateTransactionActionContent;
  isCurrentUser: boolean;
  messageId: string;
  isBuyer: boolean;
  message: MessageResData;
}

export function ActionMessage({ content, isCurrentUser, messageId, isBuyer, message }: ActionMessageProps) {
  const cancelTransaction = useCancelTransaction();
  const acceptTransaction = useAcceptTransaction();
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const totalAmount = content.unit_price * content.quantity;

  if (!isBuyer && !isCurrentUser) {
    return null;
  }

  const handleCancel = async () => {
    // Create updated message with cancelled status for optimistic update
    const updatedMessage: MessageResData = {
      ...message,
      content: {
        ...content,
        is_active: false
      }
    };
    
    await cancelTransaction.mutateAsync({ 
      messageId, 
      updatedMessage 
    });
  };

  const handleAccept = async () => {
    
    const result = await acceptTransaction.mutateAsync({ messageId });
    
    // Store payment data and show payment sheet
    setPaymentData(result);
    setShowPaymentSheet(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentSheet(false);
    setPaymentData(null);
    // Payment completed successfully - transaction is already updated via optimistic UI
  };

  const handlePaymentError = (error: Error) => {
    setShowPaymentSheet(false);
    setPaymentData(null);
    console.error('Payment failed:', error);
    // Could show an error toast here if needed
  };

  const handlePaymentCancel = () => {
    setShowPaymentSheet(false);
    setPaymentData(null);
    // User cancelled payment
  };

  return (
    <>
      <View gap="$2">
        {content.listing && (
          <View >
            <FastImage
              source={{ uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${content.listing.image_url}` }}
              style={{ width: 200, height: 150, borderRadius: 16 }}
              />
          </View>
        )}
        
        <View marginBottom="$2" gap="$1">
          <Text
            fontSize="$5"
            fontWeight="600"
            color="$foreground"
          >
            {content.listing?.name || "Transaction Initiated"}
          </Text>
          <Text
            fontSize="$4"
            color="$foreground"
          >
            {content.quantity}x at {currency} {content.unit_price / 100} = {currency} {totalAmount / 100} {/* Convert back from cents */}
          </Text>
        </View>

        {isCurrentUser ? (
          <Button 
            size="sm" 
            variant="destructive" 
            onPress={handleCancel} 
            disabled={!content.is_active || cancelTransaction.isPending}
          >
            {cancelTransaction.isPending ? "Canceling..." : content.is_active ? "Cancel" : "Cancelled"}
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="primary" 
            onPress={handleAccept} 
            disabled={!content.is_active || acceptTransaction.isPending}
          >
            {acceptTransaction.isPending ? "Processing..." : content.is_active ? "Buy" : "Completed"}
          </Button>
        )}
      </View>

      {/* Payment Sheet Modal */}
      {showPaymentSheet && paymentData?.client_secret && (
        <StripePaymentSheet
          clientSecret={paymentData.client_secret}
          amount={paymentData.amount}
          currency={paymentData.currency}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handlePaymentCancel}
        />
      )}
    </>
  );
}