import { RichInitiateTransactionActionContent } from "@bid-scents/shared-sdk";
import { Button, Text, View } from "tamagui";

interface ActionMessageProps {
  content: RichInitiateTransactionActionContent;
  isCurrentUser: boolean;
}

export function ActionMessage({ content, isCurrentUser }: ActionMessageProps) {
  const totalAmount = content.unit_price * content.quantity;

  return (
    <View
      padding="$3"
      backgroundColor={isCurrentUser ? "rgba(255,255,255,0.1)" : "$backgroundPress"}
      borderRadius="$3"
      borderWidth={1}
      borderColor={isCurrentUser ? "rgba(255,255,255,0.2)" : "$borderColor"}
    >
      {content.listing && (
        <View marginBottom="$2">
          <Text
            fontSize="$3"
            fontWeight="600"
            color={isCurrentUser ? "$white" : "$color"}
            numberOfLines={1}
          >
            {content.listing.name}
          </Text>
        </View>
      )}
      
      <View marginBottom="$2">
        <Text
          fontSize="$4"
          fontWeight="600"
          color={isCurrentUser ? "$white" : "$color"}
        >
          Transaction Initiated
        </Text>
        <Text
          fontSize="$3"
          color={isCurrentUser ? "rgba(255,255,255,0.8)" : "$color11"}
        >
          {content.quantity}x at ${content.unit_price.toFixed(2)} = ${totalAmount.toFixed(2)}
        </Text>
      </View>

      {content.is_active && (
        <Button
          size="$3"
          backgroundColor={isCurrentUser ? "blue" : "blue"}
          disabled={!content.is_active}
        >
          <Text
            fontSize="$3"
            fontWeight="600"
            color={isCurrentUser ? "$color" : "$white"}
          >
            View Transaction
          </Text>
        </Button>
      )}

      {!content.is_active && (
        <Text
          fontSize="$2"
          color={isCurrentUser ? "rgba(255,255,255,0.6)" : "$color11"}
          fontStyle="italic"
        >
          Transaction completed
        </Text>
      )}
    </View>
  );
}