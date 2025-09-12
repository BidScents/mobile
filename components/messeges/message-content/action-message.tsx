import { Button } from "@/components/ui/button";
import { currency } from "@/constants/constants";
import { useCancelTransaction } from "@/hooks/queries/use-payments";
import { MessageResData, RichInitiateTransactionActionContent } from "@bid-scents/shared-sdk";
import FastImage from "@d11/react-native-fast-image";
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

  return (
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
          {content.quantity}x at {currency} {content.unit_price.toFixed(2)} = {currency} {totalAmount.toFixed(2)}
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
        <Button size="sm" variant="primary" onPress={() => {}} disabled={!content.is_active}>
          {content.is_active ? "Buy" : "Transaction Completed"}
        </Button>
      )}
    </View>
  );
}